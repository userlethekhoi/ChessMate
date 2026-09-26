import { BoardObserver } from './board-observer.js';
import { findBoardElement, resetExtractorState, getUserColor } from './board-extractor.js';
import { Overlay } from './overlay.js';
import { ChatHUD } from './chat-hud.js';
import { executeMove } from './move-executor.js';
import { EngineManager } from '../engine/engine-manager.js';
import { getConfig, onChange } from '../storage/config-manager.js';
import { clearLlmCache } from '../ai/llm-client.js';
import { fenToBoard, squareToIndices } from '../utils/chess-translator.js';
import { logger } from '../utils/logger.js';

const observer = new BoardObserver();
const engine = new EngineManager();
let config;
let overlay;
let chatHud;
let board;
let isAnalyzing = false;
let lastAnalyzedFEN = null;  // dedup: tránh phân tích cùng một FEN nhiều lần
let nextPendingFEN = null;   // queue: FEN mới nhất cần phân tích nếu FEN đến khi đang tính
let _analysisToken = 0;      // stale guard: hủy kết quả cũ nếu FEN thay đổi giữa chừng

function startNewGameSession(reason = 'manual') {
  logger.info(`[ChessMate] Starting new game session (${reason})`);
  _analysisToken++;
  engine.stop();
  overlay?.clear();
  lastAnalyzedFEN = null;
  nextPendingFEN = null;
  observer.reset();
  resetExtractorState();
  chatHud?.reset();
  clearLlmCache();
}

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

  const fen = forcedFen || observer.getCurrentFEN();
  if (!fen) {
    const diag = observer.getLastDiagnostic() || 'Đang quét bàn cờ...';
    logger.info('Waiting for valid FEN:', diag);
    chatHud?.status(diag, true);

    setTimeout(() => {
      if (config?.enabled && !isAnalyzing) {
        const retryFen = observer.getCurrentFEN();
        if (retryFen && retryFen !== lastAnalyzedFEN) {
          analyzeCurrentState(retryFen);
        } else {
          const finalDiag = observer.getLastDiagnostic() || 'Bấm quét lại bàn cờ';
          chatHud?.status(`Quét: ${finalDiag}`);
        }
      }
    }, 600);
    return;
  }

  // Bỏ qua nếu FEN giống hệt lần phân tích trước (tránh lặp do animation/DOM noise)
  if (!forcedFen && fen === lastAnalyzedFEN) {
    logger.info('[ChessMate] FEN unchanged, skipping analysis.');
    return;
  }

  // Nếu đang phân tích nước cũ mà nước đi mới đã xuất hiện: huỷ phân tích cũ và xếp hàng FEN mới
  if (isAnalyzing) {
    logger.info('[ChessMate] New move detected during active analysis. Aborting old for new FEN:', fen);
    engine.stop();
    nextPendingFEN = fen;
    return;
  }

  isAnalyzing = true;
  lastAnalyzedFEN = fen;  // đánh dấu FEN này đang/đã được phân tích
  const myToken = ++_analysisToken;  // stale guard token
  chatHud?.status('Đang suy nghĩ nước cờ...', true);

  // Xoá arrow cũ ngay lập tức để tránh gây nhầm lẫn khi đợi kết quả mới
  overlay?.clear();

  try {
    logger.info('Analyzing FEN:', fen, 'Mode:', config.thinkingMode);
    const best = await engine.getBestMove(fen, config);

    if (!config.enabled) {
      overlay?.clear();
      return;
    }

    // Stale guard: FEN đã thay đổi trong lúc Stockfish đang tính — bỏ kết quả này
    if (myToken !== _analysisToken) {
      logger.info('[ChessMate] Stale analysis result discarded (FEN changed).');
      return;
    }

    const turn = fen.split(' ')[1] || 'w';
    const effectiveUserColor = chatHud?.sideOverride || getUserColor(board);

    // Determine the actual side of the recommended move from the piece at fromSq:
    let moveColor = turn;
    if (best.move && best.move.length >= 4) {
      const fromSq = best.move.slice(0, 2).toLowerCase();
      const fromIdx = squareToIndices(fromSq);
      if (fromIdx) {
        const boardMatrix = fenToBoard(fen);
        const p = boardMatrix?.[fromIdx.row]?.[fromIdx.col];
        if (p) {
          moveColor = (p === p.toUpperCase()) ? 'w' : 'b';
        }
      }
    }

    // Stale guard: If it is user's turn on board, but engine returned opponent's move,
    // discard and trigger fresh analysis for user's turn
    if (turn === effectiveUserColor && moveColor !== effectiveUserColor) {
      logger.info(`[ChessMate] Discarded stale opponent move (${best.move}) during user turn (${effectiveUserColor}). Triggering fresh analysis.`);
      setTimeout(() => {
        if (!isAnalyzing) analyzeCurrentState();
      }, 100);
      return;
    }

    // It is ONLY our turn if turn matches user color AND the move belongs to user's side
    const isMyTurn = (turn === effectiveUserColor) && (moveColor === effectiveUserColor);

    // Update Chat HUD with side, turn context, and shortest path efficiency note
    chatHud?.updateAnalysis({
      fen,
      uci: best.move,
      evaluation: best.evaluation,
      depth: config.depth,
      userColor: effectiveUserColor,
      isMyTurn,
      efficiencyNote: best.efficiencyNote
    });

    // Arrow overlay on board:
    // Only show green arrow when it is OUR turn!
    // When it's opponent's turn, clear overlay so user is not told to play opponent's piece!
    if (isMyTurn && config.showArrows !== false && config.showOverlay !== false) {
      overlay?.showArrow(best.move, best.evaluation, config.depth);
    } else {
      overlay?.clear();
    }

    if (isMyTurn && config.autoPlay) {
      await executeMove(board, best.move, config);
    }
  } catch (e) {
    if (e.message === 'Cancelled') {
      logger.info('[ChessMate] Previous engine analysis cancelled for newer board position.');
      return;
    }
    logger.warn('Analysis error:', e);
    chatHud?.status('Engine: ' + (e.message || 'Lỗi'));
  } finally {
    isAnalyzing = false;
    if (nextPendingFEN) {
      const queued = nextPendingFEN;
      nextPendingFEN = null;
      analyzeCurrentState(queued);
    }
  }
}

async function boot() {
  console.log('%c[ChessMate Agent]', 'color: #22c55e; font-weight: bold;', 'Content script booting on', window.location.href);
  config = await getConfig();

  // Initialize Chat HUD (Draggable, Minimizable, Unobtrusive)
  chatHud = new ChatHUD({
    onReanalyze: () => analyzeCurrentState(),
    onNewGame: () => {
      startNewGameSession('user_manual_button');
      setTimeout(() => analyzeCurrentState(), 300);
    },
    onModeChange: (mode) => {
      config.thinkingMode = mode;
      analyzeCurrentState();
    }
  });
  // Pre-warm engine iframe runner for mobile / Safari / Orion support
  try {
    engine.ensureEngineIframe();
  } catch (_) {}

  chatHud.updateConfig(config);

  let unsubscribeMove = null;
  let unsubscribeNewGame = null;

  const initBoard = (b) => {
    if (!b) return;
    if (board === b) return;

    if (board) {
      logger.info('[ChessMate] Cleaning up previous board session before attaching new board');
      unsubscribeMove?.();
      unsubscribeNewGame?.();
      overlay?.destroy();
      startNewGameSession('board_replaced');
    }

    board = b;
    logger.info('Chess board successfully located:', board);
    overlay = new Overlay(board);

    unsubscribeMove = observer.on('move-detected', async ({ fen }) => {
      await analyzeCurrentState(fen);
    });

    unsubscribeNewGame = observer.on('new-game', ({ reason }) => {
      startNewGameSession(reason);
      setTimeout(() => analyzeCurrentState(), 300);
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
    logger.info('Board not found immediately, observing DOM for board appearance...');
    const bodyObserver = new MutationObserver(() => {
      const found = findBoardElement();
      if (found) {
        bodyObserver.disconnect();
        initBoard(found);
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Watch URL changes for new game sessions (SPA navigation on chess.com)
  let lastUrl = window.location.href;
  const checkUrl = () => {
    if (window.location.href !== lastUrl) {
      logger.info(`URL navigation detected from ${lastUrl} to ${window.location.href}`);
      lastUrl = window.location.href;
      startNewGameSession('url_change');
      const b = findBoardElement();
      if (b && b !== board) {
        initBoard(b);
      } else if (b) {
        setTimeout(() => analyzeCurrentState(), 500);
      }
    }
  };
  setInterval(checkUrl, 1000);
  window.addEventListener('popstate', checkUrl);

  onChange(next => {
    const wasDisabled = !config?.enabled;
    config = { ...config, ...next };
    chatHud?.updateConfig(config);

    if (!config.enabled) {
      overlay?.clear();
      lastAnalyzedFEN = null;  // reset khi tắt để khi bật lại sẽ phân tích mới
    } else if (wasDisabled && config.enabled) {
      lastAnalyzedFEN = null;  // force re-analyze khi bật lại
      analyzeCurrentState();
    }
  });

  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg?.type === 'reanalyze') {
      analyzeCurrentState();
    }
    if (msg?.type === 'new_game' || msg?.type === 'reset_session') {
      startNewGameSession('runtime_message');
      setTimeout(() => analyzeCurrentState(), 300);
    }
    if (msg?.type === 'show_hud') {
      chatHud?.show();
    }
  });
}

boot().catch(logger.error);
