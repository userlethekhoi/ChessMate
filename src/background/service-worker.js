let creatingOffscreenPromise = null;

async function ensureOffscreen() {
  if (chrome.offscreen?.hasDocument) {
    const hasDoc = await chrome.offscreen.hasDocument();
    if (hasDoc) return;
  }

  if (creatingOffscreenPromise) {
    await creatingOffscreenPromise;
    return;
  }

  creatingOffscreenPromise = chrome.offscreen.createDocument({
    url: 'src/offscreen/offscreen.html',
    reasons: ['WORKERS'],
    justification: 'Run Stockfish WebAssembly chess engine worker'
  }).catch(err => {
    if (!err.message?.includes('Only a single offscreen document')) {
      console.error('[ChessMate SW] Failed to create offscreen document:', err);
      throw err;
    }
  }).finally(() => {
    creatingOffscreenPromise = null;
  });

  await creatingOffscreenPromise;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get().then(current => {
    if (!Object.keys(current).length) {
      chrome.storage.local.set({
        enabled: true,
        autoPlay: false,
        thinkingMode: 'mate_hunt',
        skillLevel: 20,
        depth: 16,
        movetime: 1600,
        delayMin: 800,
        delayMax: 2500,
        useLLM: false,
        llmProvider: 'openai',
        llmApiKey: '',
        showOverlay: true,
        showArrows: true,
        showHud: true,
        hudMinimized: false
      });
    }
  });
  ensureOffscreen().catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'offscreen') return;

  if (message.type === 'ENSURE_ENGINE') {
    ensureOffscreen()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'ANALYZE_POSITION') {
    (async () => {
      try {
        await ensureOffscreen();
        const response = await chrome.runtime.sendMessage({
          target: 'offscreen',
          type: 'OFFSCREEN_ANALYZE',
          fen: message.fen,
          config: message.config
        });
        sendResponse(response);
      } catch (err) {
        console.error('[ChessMate SW] Analysis routing error:', err);
        sendResponse({ success: false, error: err.message || String(err) });
      }
    })();
    return true;
  }

  if (message.type === 'STOP_ANALYSIS') {
    chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'OFFSCREEN_STOP'
    }).catch(() => {});
    sendResponse({ success: true });
    return true;
  }
});
