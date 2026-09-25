import { BoardObserver } from './board-observer.js';
import { findBoardElement } from './board-extractor.js';
import { Overlay } from './overlay.js';
import { ChatHUD } from './chat-hud.js';
import { executeMove } from './move-executor.js';
import { EngineManager } from '../engine/engine-manager.js';
import { getConfig, onChange } from '../storage/config-manager.js';
import { logger } from '../utils/logger.js';

const observer = new BoardObserver();
const engine = new EngineManager();
let config;
let overlay;
let chatHud;
let board;
let isAnalyzing = false;

async function waitForBoard(attempt = 0) {
  const el = findBoardElement();
  if (el) return el;
  if (attempt >= 12) return null;
  await new Promise(resolve => setTimeout(resolve, Math.min(3000, 150 * 1.5 ** attempt)));
  return waitForBoard(attempt + 1);
}

async function analyzeCurrentState(forcedFen = null) {
  if (!config?.enabled) {
    overlay?.clear();
    chatHud?.status('ChessMate: Đang tắt');
    return;
  }
  if (document.visibilityState === 'hidden') return;
  if (isAnalyzing) return;

  const fen = forcedFen || observer.getCurrentFEN();
  if (!fen) {
    const diag = observer.getLastDiagnostic() || 'Đang quét bàn cờ...';
    logger.warn('Could not extract valid FEN:', diag);
    chatHud?.status(diag, true);

    setTimeout(() => {
      if (config?.enabled && !isAnalyzing) {
        const retryFen = observer.getCurrentFEN();
        if (retryFen) {
          analyzeCurrentState(retryFen);
        } else {
          const finalDiag = observer.getLastDiagnostic() || 'Bấm quét lại bàn cờ';
          chatHud?.status(`Quét: ${finalDiag}`);
        }
      }
    }, 600);
    return;
  }

  isAnalyzing = true;
  chatHud?.status('Đang suy nghĩ nước cờ...', true);

  try {
    logger.info('Analyzing FEN:', fen, 'Mode:', config.thinkingMode);
    const best = await engine.getBestMove(fen, config);

    if (!config.enabled) {
      overlay?.clear();
      return;
    }

    // Update Chat HUD with Vietnamese natural language instructions
    chatHud?.updateAnalysis({
      fen,
      uci: best.move,
      evaluation: best.evaluation,
      depth: config.depth
    });

    // Arrow overlay on board: only show if user wants arrows and has not disabled overlay
    if (config.showArrows !== false && config.showOverlay !== false) {
      overlay?.showArrow(best.move, best.evaluation, config.depth);
    } else {
      overlay?.clear();
    }

    if (config.autoPlay) {
      await executeMove(board, best.move, config);
    }
  } catch (e) {
    logger.warn('Analysis error:', e);
    chatHud?.status('Engine: ' + (e.message || 'Lỗi'));
  } finally {
    isAnalyzing = false;
  }
}

async function boot() {
  console.log('%c[ChessMate Agent]', 'color: #22c55e; font-weight: bold;', 'Content script booting on', window.location.href);
  config = await getConfig();

  // Initialize Chat HUD (Draggable, Minimizable, Unobtrusive)
  chatHud = new ChatHUD({
    onReanalyze: () => analyzeCurrentState(),
    onModeChange: (mode) => {
      config.thinkingMode = mode;
      analyzeCurrentState();
    }
  });
  chatHud.updateConfig(config);

  const initBoard = (b) => {
    if (!b || board === b) return;
    board = b;
    logger.info('Chess board successfully located:', board);
    overlay = new Overlay(board);

    observer.on('move-detected', async ({ fen }) => {
      await analyzeCurrentState(fen);
    });
    observer.start(board);

    if (config.enabled) {
      setTimeout(() => analyzeCurrentState(), 200);
    } else {
      chatHud.status('ChessMate: Đang tắt');
    }
  };

  const initialBoard = await waitForBoard();
  if (initialBoard) {
    initBoard(initialBoard);
  } else {
    logger.warn('Board not found immediately, observing DOM for board appearance...');
    const bodyObserver = new MutationObserver(() => {
      const found = findBoardElement();
      if (found) {
        bodyObserver.disconnect();
        initBoard(found);
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  onChange(next => {
    const wasDisabled = !config?.enabled;
    config = { ...config, ...next };
    chatHud?.updateConfig(config);

    if (!config.enabled) {
      overlay?.clear();
    } else if (wasDisabled && config.enabled) {
      analyzeCurrentState();
    }
  });

  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg?.type === 'reanalyze') {
      analyzeCurrentState();
    }
    if (msg?.type === 'show_hud') {
      chatHud?.show();
    }
  });
}

boot().catch(logger.error);
