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
      if (!this.board || !mutations.some(m => this.board.contains(m.target))) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.check(), 120);
    });

    this.observer.observe(this.board, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Trigger immediate analysis on start
    setTimeout(() => this.check(true), 200);
  }

  check(force = false) {
    if (document.visibilityState === 'hidden') return;
    const fen = this.getCurrentFEN();
    if (!fen) return;
    if (!force && fen === this.lastFEN) return;

    const previous = this.lastFEN;
    this.lastFEN = fen;
    this.emit('move-detected', { fen, previous, board: this.board });
    this.emit('turn-changed', fen.split(' ')[1]);
  }

  forceCheck() {
    this.check(true);
  }

  stop() {
    this.observer?.disconnect();
    clearTimeout(this.timer);
    this.observer = null;
  }
}
