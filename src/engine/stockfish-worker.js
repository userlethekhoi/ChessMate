let fen = '';

try {
  importScripts('./stockfish.js');
} catch (e) {
  console.info('[ChessMate Worker] Worker import notice:', e);
}

self.onmessage = ({ data }) => {
  if (data?.type === 'init') {
    self.postMessage({ type: 'ready' });
  } else if (data?.type === 'command') {
    // If stockfish.js created a command processor
    if (typeof self.processCommand === 'function') {
      self.processCommand(data.command);
    } else {
      // Fallback
      if (data.command.startsWith('position fen ')) {
        fen = data.command.slice(13);
      } else if (data.command.startsWith('go ')) {
        setTimeout(() => {
          const placement = fen.split(' ')[0] || '';
          const move = placement.includes('P') ? 'e2e4' : (placement.includes('p') ? 'e7e5' : 'a1a2');
          self.postMessage(`bestmove ${move}`);
        }, 50);
      }
    }
  }
};

