import { EngineManager } from '../engine/engine-manager.js';

console.log('[ChessMate Offscreen] Initializing Stockfish offscreen engine runner...');
const engine = new EngineManager();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'OFFSCREEN_ANALYZE') {
    engine.getBestMove(message.fen, message.config)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(err => {
        console.error('[ChessMate Offscreen] Engine calculation error:', err);
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true; // Keep sendResponse open for asynchronous engine calculation
  }

  if (message.type === 'OFFSCREEN_STOP') {
    engine.stop();
    sendResponse({ success: true });
    return true;
  }
});
