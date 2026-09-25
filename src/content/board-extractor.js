import { BOARD_SELECTORS, SQUARE_SELECTORS } from '../utils/constants.js';
import { boardToPlacement, isValidFen } from '../utils/chess-utils.js';
import { logger } from '../utils/logger.js';

export let lastDiagnostic = '';

const PIECE_MAP = { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', horse: 'n', pawn: 'p' };

export function parsePieceText(text, el = null) {
  text = String(text || '').toLowerCase();
  
  // 1. Direct class match (e.g. "wk", "bp", "wn", "bb", "square-75 wb")
  const shortMatch = text.match(/\b([wb])([kqrbnp])\b/);
  if (shortMatch) {
    const [, color, type] = shortMatch;
    return color === 'w' ? type.toUpperCase() : type.toLowerCase();
  }

  // 2. Background image or image src URL match (e.g. ".../neo/150/wp.png" or "wk.svg")
  if (el) {
    const bg = el.style?.backgroundImage || (typeof window !== 'undefined' ? window.getComputedStyle(el).backgroundImage : '') || '';
    const src = el.src || el.getAttribute?.('src') || '';
    const urlCombined = `${bg} ${src}`.toLowerCase();
    const urlMatch = urlCombined.match(/\/([wb])([kqrbnp])\.(?:png|svg|webp)/i);
    if (urlMatch) {
      const [, color, type] = urlMatch;
      return color === 'w' ? type.toUpperCase() : type.toLowerCase();
    }
  }

  // 3. Descriptive match (e.g. "white-pawn", "black king", aria-label="White King")
  const isWhite = /white|\bwp\b|\bwr\b|\bwn\b|\bwb\b|\bwq\b|\bwk\b/.test(text);
  const isBlack = /black|\bbp\b|\bbr\b|\bbn\b|\bbb\b|\bbq\b|\bbk\b/.test(text);
  if (!isWhite && !isBlack) return null;

  for (const [name, char] of Object.entries(PIECE_MAP)) {
    if (text.includes(name)) {
      return isWhite ? char.toUpperCase() : char.toLowerCase();
    }
  }

  return null;
}

export function readPieceFromSquare(el) {
  if (!el) return null;
  const rawCls = String(el.className || el.getAttribute?.('class') || '');
  const dataPiece = el.getAttribute?.('data-piece') || '';
  const ariaLabel = el.getAttribute?.('aria-label') || '';
  return parsePieceText(`${rawCls} ${dataPiece} ${ariaLabel}`, el);
}

export function findBoardElement(root = document) {
  // 1. Direct standard custom elements (strictly prioritizing the actual chessboard)
  const wc = root.querySelector('wc-chess-board, chess-board');
  if (wc && wc.getBoundingClientRect().width > 120) return wc;

  for (const selector of BOARD_SELECTORS) {
    const el = root.querySelector(selector);
    if (el && el.getBoundingClientRect().width > 120) return el;
  }

  // 2. Discover board from any piece element
  const piece = root.querySelector('.piece, [class*="piece"], [data-piece]');
  if (piece) {
    const candidate = piece.closest('wc-chess-board, chess-board, .board, [id*="board"], [class*="board"]') || piece.parentElement;
    if (candidate && candidate.getBoundingClientRect().width > 120) return candidate;
  }

  // 3. Fallback: inspect any square-sized board candidate
  const candidates = root.querySelectorAll('[id*="board"], [class*="board"], [class*="chessboard"]');
  for (const b of candidates) {
    const r = b.getBoundingClientRect();
    if (r.width > 180 && r.height > 180 && Math.abs(r.width - r.height) < 50) {
      return b;
    }
  }

  return null;
}

function findSquare(board, rank, file) {
  for (const s of SQUARE_SELECTORS(rank, file)) {
    const el = board.querySelector(s) || board.shadowRoot?.querySelector(s);
    if (el) return el;
  }
  return null;
}

function isPieceAlive(piece) {
  const cls = String(piece.getAttribute?.('class') || piece.className || '').toLowerCase();
  if (cls.includes('captured') || cls.includes('ghost') || cls.includes('dragging-source')) return false;
  if (piece.style?.display === 'none' || piece.style?.visibility === 'hidden') return false;
  return true;
}

function getSquareIndices(piece, rect, flipped) {
  const cls = [
    String(piece.getAttribute?.('class') || piece.className || ''),
    String(piece.parentElement?.getAttribute?.('class') || piece.parentElement?.className || ''),
    String(piece.getAttribute?.('data-square') || ''),
    String(piece.parentElement?.getAttribute?.('data-square') || '')
  ].join(' ');

  // 1. Numeric square-XY: square-54 -> file 5, rank 4
  const numMatch = cls.match(/square-0?([1-8])0?([1-8])/);
  if (numMatch) {
    const file = parseInt(numMatch[1], 10);
    const rank = parseInt(numMatch[2], 10);
    return { fileIdx: file - 1, rankIdx: 8 - rank };
  }

  // 2. Alpha square-e4
  const alphaMatch = cls.match(/square-([a-h])([1-8])/i);
  if (alphaMatch) {
    const fileIdx = 'abcdefgh'.indexOf(alphaMatch[1].toLowerCase());
    const rankIdx = 8 - parseInt(alphaMatch[2], 10);
    return { fileIdx, rankIdx };
  }

  // 3. Precise geometry fallback from bounding client rect
  if (rect?.width && rect?.height) {
    const p = piece.getBoundingClientRect();
    if (p.width > 5 && p.height > 5) {
      const cx = p.left + p.width / 2;
      const cy = p.top + p.height / 2;
      if (cx >= rect.left - 10 && cx <= rect.right + 10 && cy >= rect.top - 10 && cy <= rect.bottom + 10) {
        let fileIdx = Math.max(0, Math.min(7, Math.floor(((cx - rect.left) / rect.width) * 8)));
        let rankIdx = Math.max(0, Math.min(7, Math.floor(((cy - rect.top) / rect.height) * 8)));
        if (flipped) {
          fileIdx = 7 - fileIdx;
          rankIdx = 7 - rankIdx;
        }
        return { fileIdx, rankIdx };
      }
    }
  }

  return null;
}

function collectAllElements(container = document) {
  const elements = new Set();
  const queue = [container];
  const seen = new Set();

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || seen.has(node)) continue;
    seen.add(node);

    if (node instanceof Element) {
      elements.add(node);
      if (node.shadowRoot && !seen.has(node.shadowRoot)) {
        queue.push(node.shadowRoot);
      }
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        queue.push(node.children[i]);
      }
    }
  }

  // Also gather from any wc-chess-board or chess-board anywhere in document
  document.querySelectorAll('wc-chess-board, chess-board, .board, #board-single').forEach(b => {
    if (!seen.has(b)) queue.push(b);
    if (b.shadowRoot && !seen.has(b.shadowRoot)) queue.push(b.shadowRoot);
  });

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || seen.has(node)) continue;
    seen.add(node);

    if (node instanceof Element) {
      elements.add(node);
      if (node.shadowRoot && !seen.has(node.shadowRoot)) {
        queue.push(node.shadowRoot);
      }
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        queue.push(node.children[i]);
      }
    }
  }

  return Array.from(elements);
}

function extractFromPieces(board) {
  const rect = board.getBoundingClientRect();
  const flipped = board.classList.contains('flipped');
  const candidates = collectAllElements(board);

  const rows = Array.from({ length: 8 }, () => Array(8).fill(null));
  let pieceCount = 0;

  for (const el of candidates) {
    if (!isPieceAlive(el)) continue;
    const value = readPieceFromSquare(el);
    if (!value) continue;

    const coords = getSquareIndices(el, rect, flipped);
    if (!coords) continue;

    const { fileIdx, rankIdx } = coords;
    if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
      rows[rankIdx][fileIdx] = value;
      pieceCount++;
    }
  }

  lastDiagnostic = `Scanned ${candidates.length} els, found ${pieceCount} pieces`;
  logger.info(`[ChessMate] ${lastDiagnostic}`);
  return pieceCount >= 2 ? boardToPlacement(rows) : null;
}

function detectTurn(board) {
  // 1. Check highlights for the last move made
  const highlights = board.querySelectorAll('.highlight, [class*="highlight"]');
  if (highlights.length >= 2) {
    for (const h of highlights) {
      const cls = String(h.getAttribute('class') || h.className || '');
      const match = cls.match(/square-0?([1-8])0?([1-8])/);
      if (match) {
        const rank = parseInt(match[2], 10);
        // If a piece moved from/to rank 7 or 8, it's likely Black who moved -> now White's turn
        if (rank >= 7) return 'w';
        // If a piece moved from/to rank 1 or 2, it's likely White who moved -> now Black's turn
        if (rank <= 2) return 'b';
      }
    }
  }

  // 2. Check clock highlighting
  const flipped = board.classList.contains('flipped');
  const bottomClockTurn = document.querySelector('.clock-bottom.clock-player-turn, .clock-player-turn.clock-bottom');
  const topClockTurn = document.querySelector('.clock-top.clock-player-turn, .clock-player-turn.clock-top');

  if (bottomClockTurn) return flipped ? 'b' : 'w';
  if (topClockTurn) return flipped ? 'w' : 'b';

  // 3. Check move list for last move
  const moveNodes = document.querySelectorAll('.move-list-item, .move-node, [data-whole-move-number]');
  if (moveNodes.length > 0) {
    const lastNode = moveNodes[moveNodes.length - 1];
    if (lastNode.classList.contains('black') || lastNode.closest('.black')) {
      return 'w';
    }
    if (lastNode.classList.contains('white') || lastNode.closest('.white')) {
      return 'b';
    }
  }

  return 'w';
}

function getFenFromGame(board) {
  const targets = [
    board,
    document.querySelector('wc-chess-board'),
    document.querySelector('chess-board')
  ];
  for (const t of targets) {
    if (!t) continue;
    try {
      if (typeof t.game?.getFEN === 'function') {
        const f = t.game.getFEN();
        if (isValidFen(f)) return f;
      }
      if (typeof t.getFEN === 'function') {
        const f = t.getFEN();
        if (isValidFen(f)) return f;
      }
      if (t.fen && isValidFen(t.fen)) return t.fen;
      if (t.dataset?.fen && isValidFen(t.dataset.fen)) return t.dataset.fen;
    } catch (_) {}
  }
  return null;
}

export function extractFEN(board = findBoardElement()) {
  if (!board) {
    lastDiagnostic = 'Board element not found';
    return null;
  }

  // 1. Direct game instance API (fastest, 100% accurate if available)
  const apiFen = getFenFromGame(board);
  if (apiFen) {
    lastDiagnostic = 'OK (game API)';
    logger.info('[ChessMate] Extracted FEN from game API:', apiFen);
    return apiFen;
  }

  // 2. Extract from pieces (recursively scanning all shadow roots)
  let placement = extractFromPieces(board);

  // 3. Fallback: iterate over squares
  if (!placement) {
    const rows = [];
    let found = false;
    for (let rank = 8; rank >= 1; rank--) {
      const row = [];
      for (const file of 'abcdefgh') {
        const piece = readPieceFromSquare(findSquare(board, rank, file));
        if (piece) found = true;
        row.push(piece);
      }
      rows.push(row);
    }
    if (found) placement = boardToPlacement(rows);
  }

  if (!placement) {
    logger.warn('[ChessMate] Could not extract board placement:', lastDiagnostic);
    return null;
  }

  const turn = detectTurn(board);
  const fen = `${placement} ${turn} KQkq - 0 1`;
  if (!isValidFen(fen)) {
    lastDiagnostic = `Invalid FEN: ${fen.slice(0, 30)}...`;
    logger.warn('[ChessMate] Board state could not be validated:', fen);
    return null;
  }
  
  lastDiagnostic = 'OK';
  logger.info('[ChessMate] Successfully extracted FEN:', fen);
  return fen;
}
