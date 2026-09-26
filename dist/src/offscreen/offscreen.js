import { EngineManager } from '../engine/engine-manager.js';

// Suppress unhandled WebAssembly unreachable runtime errors from registering in extension error log
window.addEventListener('error', e => {
  if (e?.message?.includes('unreachable') || e?.error?.message?.includes('unreachable')) {
    e.preventDefault();
    console.info('[ChessMate Offscreen] WebAssembly unreachable caught and recovered.');
  }
});
window.addEventListener('unhandledrejection', e => {
  if (String(e?.reason?.message || e?.reason).includes('unreachable')) {
    e.preventDefault();
    console.info('[ChessMate Offscreen] WebAssembly unhandledrejection caught and recovered.');
  }
});

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
        const isCancelled = err?.message === 'Cancelled' || String(err).includes('Cancelled');
        if (!isCancelled) {
          console.info('[ChessMate Offscreen] Engine calculation notice:', err?.message || err);
        }
        sendResponse({ success: false, error: err?.message || String(err) });
      });
    return true; // Keep sendResponse open for asynchronous engine calculation
  }

  if (message.type === 'OFFSCREEN_STOP') {
    engine.stop();
    sendResponse({ success: true });
    return true;
  }
});

// Also support direct window.postMessage when embedded as an invisible iframe in content script (Mobile / Orion fallback)
window.addEventListener('message', async (event) => {
  if (event.data?.target !== 'offscreen') return;

  if (event.data?.type === 'OFFSCREEN_ANALYZE') {
    const { id, fen, config } = event.data;
    try {
      const result = await engine.getBestMove(fen, config);
      event.source?.postMessage({
        target: 'chessmate_content',
        id,
        success: true,
        result
      }, '*');
    } catch (err) {
      const isCancelled = err?.message === 'Cancelled' || String(err).includes('Cancelled');
      if (!isCancelled) {
        console.info('[ChessMate Offscreen IFrame] Engine calculation notice:', err?.message || err);
      }
      event.source?.postMessage({
        target: 'chessmate_content',
        id,
        success: false,
        error: err?.message || String(err)
      }, '*');
    }
  }

  if (event.data?.type === 'OFFSCREEN_STOP') {
    engine.stop();
    event.source?.postMessage({
      target: 'chessmate_content',
      type: 'STOPPED'
    }, '*');
  }
});

// Announce ready to parent frame if running in iframe
try {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ target: 'chessmate_content', type: 'OFFSCREEN_READY' }, '*');
  }
} catch (_) {}

