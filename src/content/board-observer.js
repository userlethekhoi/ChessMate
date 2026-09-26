import { extractFEN, findBoardElement, lastDiagnostic } from './board-extractor.js';
import { logger } from '../utils/logger.js';
export class BoardObserver {
  constructor() {
    this.listeners = new Map();
    this.lastFEN = null;
    this.timer = null;
    this.observer = null;
    this.board = null;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach(fn => {
      try {
        fn(data);
      } catch (e) {
        logger.error(e);
      }
    });
  }

  getLastDiagnostic() {
    return lastDiagnostic;
  }

  getCurrentFEN() {
    return extractFEN(this.board || findBoardElement());
  }

  start(boardEl = null) {
    this.board = boardEl || findBoardElement();
    if (!this.board) {
      let retries = 0;
      const retry = () => {
        this.board = findBoardElement();
        if (this.board) {
          this.initObserver();
        } else if (retries++ < 8) {
          setTimeout(retry, 150 * 2 ** retries);
        }
      };
      setTimeout(retry, 150);
      return;
    }
    this.initObserver();
  }

  initObserver() {
    if (!this.board) return;
    this.stop();
    this.observer = new MutationObserver(mutations => {
      clearTimeout(this.timer);
      // 220ms: đủ để animation quân cờ chess.com (~200ms) hoàn tất trước khi đọc FEN
      this.timer = setTimeout(() => this.check(), 220);
    });

    const obsConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-square', 'data-piece', 'data-fen']
    };

    try {
      this.observer.observe(this.board, obsConfig);
      if (this.board.shadowRoot) {
        this.observer.observe(this.board.shadowRoot, obsConfig);
      }
    } catch (_) {}

    // Polling heartbeat (650ms): ensures touch moves and mobile re-renders are never missed
    clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      this.check();
    }, 650);

    // Trigger immediate analysis on start
    setTimeout(() => this.check(true), 150);
  }

  check(force = false) {
    if (document.visibilityState === 'hidden') return;
    const fen = this.getCurrentFEN();
    if (!fen) return;
    if (!force && fen === this.lastFEN) return;

    const previous = this.lastFEN;
    this.lastFEN = fen;

    // Detect game restart to initial position
    const START_POS = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    if (fen.startsWith(START_POS) && previous && !previous.startsWith(START_POS)) {
      this.emit('new-game', { fen, reason: 'start_position_reset' });
    }

    this.emit('move-detected', { fen, previous, board: this.board });
    this.emit('turn-changed', fen.split(' ')[1]);
  }

  forceCheck() {
    this.check(true);
  }

  reset() {
    this.lastFEN = null;
    clearTimeout(this.timer);
  }

  stop() {
    this.observer?.disconnect();
    clearTimeout(this.timer);
    clearInterval(this.pollInterval);
    this.pollInterval = null;
    this.observer = null;
  }
}
