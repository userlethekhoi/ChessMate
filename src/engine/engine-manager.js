import { logger } from '../utils/logger.js';
import { getModeConfig } from './thinking-modes.js';

export class EngineManager {
  constructor() {
    this.worker = null;
    this.ready = false;
    this.pending = null;
    this.lastEvaluation = 0;
  }

  isContentScript() {
    return (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol.startsWith('http') &&
      Boolean(globalThis.chrome?.runtime?.sendMessage)
    );
  }

  async init() {
    if (this.isContentScript()) return;
    if (this.ready && this.worker) return;

    try {
      const sfUrl = globalThis.chrome?.runtime?.getURL?.('src/engine/stockfish.js') || new URL('./stockfish.js', import.meta.url).href;
      this.worker = new Worker(sfUrl);

      this.worker.onmessage = e => this.handle(e.data);
      this.worker.onerror = err => {
        logger.error('Stockfish worker error:', err);
      };

      // Send UCI handshake
      this.worker.postMessage('uci');
      this.worker.postMessage('isready');

      // Wait a short moment for engine to initialize
      await new Promise(r => setTimeout(r, 120));
      this.ready = true;
    } catch (e) {
      logger.error('Engine init failed:', e);
      throw e;
    }
  }

  handle(line) {
    const text = typeof line === 'string' ? line : line?.line || '';
    if (!text) return;

    // Parse score from info line (e.g. "info depth 12 score cp 45 ...")
    if (text.startsWith('info') && text.includes('score')) {
      const cpMatch = text.match(/score\s+cp\s+(-?\d+)/);
      if (cpMatch) {
        this.lastEvaluation = parseInt(cpMatch[1], 10) / 100;
      } else {
        const mateMatch = text.match(/score\s+mate\s+(-?\d+)/);
        if (mateMatch) {
          const m = parseInt(mateMatch[1], 10);
          this.lastEvaluation = m > 0 ? 999 : -999;
        }
      }
    }

    if (text.startsWith('bestmove') && this.pending) {
      const parts = text.split(/\s+/);
      const move = parts[1];
      const ponder = parts[3] || null;
      const p = this.pending;
      this.pending = null;

      if (!move || move === '(none)') {
        p.reject(new Error('No legal move available'));
      } else {
        p.resolve({
          move,
          ponder,
          evaluation: this.lastEvaluation
        });
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
      return new Promise((resolve, reject) => {
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

    const skillLevel = config.skillLevel ?? 20;
    await this.init();
    this.stop();
    this.lastEvaluation = 0;

    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };

      try {
        this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
        if (modeCfg.contempt !== undefined) {
          this.worker.postMessage(`setoption name Contempt value ${modeCfg.contempt}`);
        }
      } catch (_) {}

      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${targetDepth} movetime ${targetMovetime}`);

      const timeoutMs = targetMovetime + 4500;
      setTimeout(() => {
        if (this.pending?.resolve === resolve) {
          this.worker.postMessage('stop');
          this.pending = null;
          reject(new Error('Engine calculation timeout'));
        }
      }, timeoutMs);
    });
  }

  stop() {
    if (this.isContentScript()) {
      chrome.runtime?.sendMessage?.({ type: 'STOP_ANALYSIS' })?.catch?.(() => {});
      return;
    }
    this.worker?.postMessage('stop');
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
