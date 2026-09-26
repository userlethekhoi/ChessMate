import { logger } from '../utils/logger.js';
import { getModeConfig } from './thinking-modes.js';
import { selectShortestAndMostDirectMove } from './move-optimizer.js';

export class EngineManager {
  constructor() {
    this.worker = null;
    this.ready = false;
    this.pending = null;
    this.lastEvaluation = 0;
    this.isSearching = false;
    this.readyResolvers = [];
    this.currentCandidates = new Map();
    this.currentAnalyzingFen = null;
    this.currentAnalyzingColor = 'w';
  }

  isContentScript() {
    return (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol.startsWith('http') &&
      Boolean(globalThis.chrome?.runtime?.sendMessage)
    );
  }

  waitReady(timeout = 800) {
    if (!this.worker) return Promise.resolve();
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        const idx = this.readyResolvers.indexOf(resolve);
        if (idx !== -1) this.readyResolvers.splice(idx, 1);
        resolve();
      }, timeout);

      this.readyResolvers.push(() => {
        clearTimeout(timer);
        resolve();
      });

      try {
        this.worker.postMessage('isready');
      } catch (_) {
        resolve();
      }
    });
  }

  async init() {
    if (this.isContentScript()) return;
    if (this.ready && this.worker) return;

    try {
      const sfUrl = globalThis.chrome?.runtime?.getURL?.('src/engine/stockfish.js') || new URL('./stockfish.js', import.meta.url).href;
      this.worker = new Worker(sfUrl);

      this.worker.onmessage = e => this.handle(e.data);
      this.worker.onerror = err => {
        err?.preventDefault?.();
        logger.info('[ChessMate Worker] Worker error notice handled:', err?.message || err);
        try { this.worker?.terminate(); } catch (_) {}
        this.worker = null;
        this.ready = false;
        this.isSearching = false;
        if (this.pending) {
          this.pending.reject?.(new Error('Engine worker reset'));
          this.pending = null;
        }
      };

      // Send UCI handshake
      this.worker.postMessage('uci');
      await this.waitReady(1000);
      this.ready = true;
    } catch (e) {
      logger.info('Engine init notice:', e);
      throw e;
    }
  }

  handle(line) {
    const text = typeof line === 'string' ? line : line?.line || '';
    if (!text) return;

    if (text === 'readyok') {
      const resolvers = this.readyResolvers.splice(0);
      for (const r of resolvers) {
        try { r(); } catch (_) {}
      }
      return;
    }

    // Parse score and principal variations from info lines
    if (text.startsWith('info') && text.includes('score')) {
      const pvMatch = text.match(/\bpv\s+([a-h1-8qrbn\s]+)/);
      const multiPvMatch = text.match(/\bmultipv\s+(\d+)/);
      const pvStr = pvMatch ? pvMatch[1].trim() : '';
      const pvParts = pvStr ? pvStr.split(/\s+/) : [];
      const move = pvParts[0] || null;

      let scoreCp = null;
      let mateIn = null;
      let evalScore = 0;

      const cpMatch = text.match(/score\s+cp\s+(-?\d+)/);
      if (cpMatch) {
        scoreCp = parseInt(cpMatch[1], 10) / 100;
        evalScore = scoreCp;
        this.lastEvaluation = scoreCp;
      } else {
        const mateMatch = text.match(/score\s+mate\s+(-?\d+)/);
        if (mateMatch) {
          mateIn = parseInt(mateMatch[1], 10);
          evalScore = mateIn > 0 ? 999 : -999;
          this.lastEvaluation = mateIn > 0 ? `#${mateIn}` : `#${mateIn}`;
        }
      }

      if (move) {
        const mpvIndex = multiPvMatch ? parseInt(multiPvMatch[1], 10) : 1;
        this.currentCandidates.set(mpvIndex, {
          multipv: mpvIndex,
          move,
          evaluation: evalScore,
          scoreCp,
          mateIn,
          pv: pvParts
        });
      }
    }

    if (text.startsWith('bestmove')) {
      this.isSearching = false;
      if (this.pending) {
        const parts = text.split(/\s+/);
        const defaultMove = parts[1];
        const ponder = parts[3] || null;
        const p = this.pending;
        this.pending = null;

        if (!defaultMove || defaultMove === '(none)') {
          p.reject(new Error('No legal move available'));
        } else {
          const candidatesList = Array.from(this.currentCandidates.values());
          const optimal = selectShortestAndMostDirectMove({
            candidates: candidatesList,
            defaultBestMove: defaultMove,
            fen: this.currentAnalyzingFen,
            userColor: this.currentAnalyzingColor
          });

          p.resolve({
            move: optimal.move || defaultMove,
            ponder,
            evaluation: optimal.evaluation ?? this.lastEvaluation,
            mateIn: optimal.mateIn,
            efficiencyNote: optimal.efficiencyNote,
            pv: optimal.pv
          });
        }
      }
    }
  }

  async getBestMove(fen, config = {}) {
    const modeKey = config.thinkingMode || 'mate_hunt';
    const modeCfg = getModeConfig(modeKey);
    const targetDepth = Math.max(5, (config.depth ?? 16) + modeCfg.depthBonus);
    const targetMovetime = Math.round((config.movetime ?? 1600) * modeCfg.movetimeMultiplier);

    // If running in a webpage context (content script), delegate to extension background/offscreen
    if (this.isContentScript()) {
      this.stop();
      return new Promise((resolve, reject) => {
        let isCancelled = false;
        this.contentScriptPending = {
          resolve,
          reject,
          cancel: () => {
            isCancelled = true;
            reject(new Error('Cancelled'));
          }
        };

        chrome.runtime.sendMessage(
          {
            type: 'ANALYZE_POSITION',
            fen,
            config: {
              skillLevel: config.skillLevel ?? 20,
              depth: targetDepth,
              movetime: targetMovetime,
              thinkingMode: modeKey
            }
          },
          response => {
            if (isCancelled) return;
            this.contentScriptPending = null;
            if (chrome.runtime.lastError) {
              return reject(new Error(chrome.runtime.lastError.message));
            }
            if (!response || !response.success) {
              return reject(new Error(response?.error || 'Engine calculation failed'));
            }
            resolve(response.result);
          }
        );
      });
    }

    // Offscreen context: run Stockfish directly
    if (!fen || typeof fen !== 'string' || fen.split(' ').length < 2) {
      throw new Error('Invalid FEN provided for analysis');
    }

    const skillLevel = config.skillLevel ?? 20;
    await this.init();

    // If already searching or pending, safely stop and wait for engine to settle
    if (this.isSearching || this.pending) {
      this.stop();
      await this.waitReady(500);
    }
    this.lastEvaluation = 0;
    this.isSearching = true;
    this.currentAnalyzingFen = fen;
    this.currentAnalyzingColor = fen.split(' ')[1] || 'w';
    this.currentCandidates.clear();

    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };

      try {
        this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
        this.worker?.postMessage('setoption name MultiPV value 3');
        this.worker?.postMessage(`setoption name Contempt value ${modeCfg.contempt ?? 80}`);
      } catch (_) {}

      try {
        this.worker?.postMessage(`position fen ${fen}`);
        this.worker?.postMessage(`go depth ${targetDepth} movetime ${targetMovetime}`);
      } catch (err) {
        this.isSearching = false;
        this.pending = null;
        return reject(err);
      }

      const timeoutMs = targetMovetime + 4500;
      setTimeout(() => {
        if (this.pending?.resolve === resolve) {
          try { this.worker?.postMessage('stop'); } catch (_) {}
          this.isSearching = false;
          this.pending = null;
          reject(new Error('Engine calculation timeout'));
        }
      }, timeoutMs);
    });
  }

  stop() {
    if (this.isContentScript()) {
      if (this.contentScriptPending) {
        this.contentScriptPending.cancel?.();
        this.contentScriptPending = null;
      }
      chrome.runtime?.sendMessage?.({ type: 'STOP_ANALYSIS' })?.catch?.(() => {});
      return;
    }

    if (this.isSearching && this.worker) {
      try {
        this.worker.postMessage('stop');
      } catch (_) {}
    }
    this.isSearching = false;

    if (this.pending) {
      this.pending.reject?.(new Error('Cancelled'));
      this.pending = null;
    }
  }

  destroy() {
    this.stop();
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }
}
