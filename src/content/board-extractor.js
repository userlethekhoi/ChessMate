import { BOARD_SELECTORS, SQUARE_SELECTORS } from '../utils/constants.js';
import { boardToPlacement, isValidFen } from '../utils/chess-utils.js';
import { logger } from '../utils/logger.js';

export let lastDiagnostic = '';
let _prevPlacement = null;  // dùng để so sánh phát hiện en passant

export function resetExtractorState() {
  _prevPlacement = null;
  lastDiagnostic = '';
}


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

export function hasValidBoardPieces(el) {
  if (!el || typeof el.getBoundingClientRect !== 'function') return false;
  const r = el.getBoundingClientRect();
  if (r.width < 140 || r.height < 140) return false;

  // A chessboard MUST be approximately square (tolerance: aspect ratio 0.85 to 1.18)
  // This strictly rejects outer layout containers (e.g. .board-layout-main, sidebars, page wrappers)
  const ratio = r.width / r.height;
  if (ratio < 0.85 || ratio > 1.18) return false;

  const searchRoots = [el];
  if (el.shadowRoot) searchRoots.push(el.shadowRoot);
  let pieceCount = 0;
  for (const root of searchRoots) {
    const pieces = root.querySelectorAll?.('.piece, [class*="piece"], [data-piece]');
    if (pieces) pieceCount += pieces.length;
  }
  return pieceCount >= 2;
}

export function findBoardElement(root = document) {
  // 1. Direct standard custom elements (strictly prioritizing the actual chessboard)
  const wc = root.querySelector('wc-chess-board, chess-board, #board-single');
  if (wc && hasValidBoardPieces(wc)) return wc;

  for (const selector of BOARD_SELECTORS) {
    const el = root.querySelector(selector);
    if (el && hasValidBoardPieces(el)) return el;
  }

  // 2. Discover board from piece elements (only if at least 2 pieces exist)
  const pieces = root.querySelectorAll?.('.piece, [class*="piece"], [data-piece]') || [];
  if (pieces.length >= 2) {
    for (const piece of pieces) {
      const candidate = piece.closest?.('wc-chess-board, chess-board, #board-single, .board, [id*="board"], [class*="board"]') || piece.parentElement;
      if (candidate && hasValidBoardPieces(candidate)) {
        // If candidate contains a standard inner board, prefer the innermost board
        const inner = candidate.querySelector?.('wc-chess-board, chess-board, #board-single, .board');
        if (inner && inner !== candidate && hasValidBoardPieces(inner)) return inner;
        return candidate;
      }
    }
  }

  // 3. Fallback: inspect any square-sized board candidate with pieces, preferring innermost (smallest area)
  const candidates = Array.from(root.querySelectorAll?.('wc-chess-board, chess-board, #board-single, .board, [id*="board"], [class*="board"], [class*="chessboard"]') || [])
    .filter(b => hasValidBoardPieces(b));

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return (ra.width * ra.height) - (rb.width * rb.height);
    });
    return candidates[0];
  }

  // If no populated board is found yet, check if wc-chess-board is still initializing (0 pieces during setup)
  if (wc) {
    const r = wc.getBoundingClientRect();
    if (r.width > 140 && r.height > 140) {
      const ratio = r.width / r.height;
      if (ratio >= 0.85 && ratio <= 1.18) return wc;
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
  if (piece.style?.opacity === '0' || piece.getAttribute('style')?.includes('opacity: 0')) return false;
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

export function getPieceOnSquare(board, square) {
  if (!board || !square || square.length < 2) return null;
  const fileChar = square[0].toLowerCase();
  const fileNum = 'abcdefgh'.indexOf(fileChar) + 1;
  const rankNum = parseInt(square[1], 10);
  if (fileNum < 1 || fileNum > 8 || rankNum < 1 || rankNum > 8) return null;

  const selectors = [
    `.piece.square-${fileNum}${rankNum}`,
    `.piece.square-0${fileNum}0${rankNum}`,
    `.piece.square-${fileChar}${rankNum}`,
    `[class*="piece"][class*="square-${fileNum}${rankNum}"]`,
    `[class*="piece"][class*="square-${fileChar}${rankNum}"]`,
    `[class*="square-${fileNum}${rankNum}"]`,
    `[class*="square-${fileChar}${rankNum}"]`,
    `[data-square="${fileChar}${rankNum}"]`,
    `[data-square="${fileNum}${rankNum}"]`
  ];

  const searchRoots = [board];
  if (board.shadowRoot) searchRoots.push(board.shadowRoot);

  for (const root of searchRoots) {
    for (const sel of selectors) {
      const el = root.querySelector?.(sel);
      if (el && isPieceAlive(el)) {
        return el;
      }
    }
  }

  // Fallback: check all pieces inside board using getSquareIndices
  const pieces = board.querySelectorAll?.('.piece, [class*="piece"], [data-piece]') || [];
  const flipped = isBoardFlipped(board);
  const rect = board.getBoundingClientRect();
  for (const p of pieces) {
    if (!isPieceAlive(p)) continue;
    const indices = getSquareIndices(p, rect, flipped);
    if (indices) {
      const pFile = 'abcdefgh'[indices.fileIdx];
      const pRank = 8 - indices.rankIdx;
      if (pFile === fileChar && pRank === rankNum) {
        return p;
      }
    }
  }

  return null;
}

export function getSquareCenter(board, square, srcCenter = null, srcSquare = null) {
  if (!board || !square || square.length < 2) return null;
  const fileChar = square[0].toLowerCase();
  const fileNum = 'abcdefgh'.indexOf(fileChar) + 1;
  const rankNum = parseInt(square[1], 10);
  const flipped = isBoardFlipped(board);

  // 1. Direct piece check: If there is a piece on this square (e.g. source piece or captured piece)
  const piece = getPieceOnSquare(board, square);
  if (piece) {
    const pr = piece.getBoundingClientRect();
    if (pr.width > 5 && pr.height > 5) {
      return {
        x: pr.left + pr.width / 2,
        y: pr.top + pr.height / 2,
        width: pr.width,
        height: pr.height
      };
    }
  }

  // 2. Check if a dedicated square element exists (e.g. highlight or square element)
  const squareEl = findSquare(board, rankNum, fileChar);
  if (squareEl) {
    const sr = squareEl.getBoundingClientRect();
    if (sr.width > 5 && sr.height > 5) {
      return {
        x: sr.left + sr.width / 2,
        y: sr.top + sr.height / 2,
        width: sr.width,
        height: sr.height
      };
    }
  }

  // 3. Intersection of other live pieces on the board (same file and same rank)
  // This gives the exact physical grid alignments used by the website
  const allPieces = board.querySelectorAll?.('.piece, [class*="piece"], [data-piece]') || [];
  const bRect = board.getBoundingClientRect();
  let fileX = null;
  let rankY = null;
  let squareW = srcCenter?.width || null;
  let squareH = srcCenter?.height || null;

  for (const p of allPieces) {
    if (!isPieceAlive(p)) continue;
    const indices = getSquareIndices(p, bRect, flipped);
    if (!indices) continue;
    const pr = p.getBoundingClientRect();
    if (pr.width < 5 || pr.height < 5) continue;

    squareW = squareW || pr.width;
    squareH = squareH || pr.height;

    const pFile = 'abcdefgh'[indices.fileIdx];
    const pRank = 8 - indices.rankIdx;

    if (pFile === fileChar && fileX === null) {
      fileX = pr.left + pr.width / 2;
    }
    if (pRank === rankNum && rankY === null) {
      rankY = pr.top + pr.height / 2;
    }
    if (fileX !== null && rankY !== null) break;
  }

  // 4. Projection from source piece (if available)
  if ((fileX === null || rankY === null) && srcCenter && srcSquare) {
    const srcFileNum = 'abcdefgh'.indexOf(srcSquare[0].toLowerCase()) + 1;
    const srcRankNum = parseInt(srcSquare[1], 10);
    const sqW = squareW || srcCenter.width || (bRect.width / 8);
    const sqH = squareH || srcCenter.height || (bRect.height / 8);

    const deltaCol = (fileNum - srcFileNum) * (flipped ? -1 : 1);
    const deltaRow = (rankNum - srcRankNum) * (flipped ? 1 : -1);

    if (fileX === null) fileX = srcCenter.x + deltaCol * sqW;
    if (rankY === null) rankY = srcCenter.y + deltaRow * sqH;
  }

  // 5. Ultimate fallback: board bounding client rect geometry
  const sqW = squareW || (bRect.width / 8);
  const sqH = squareH || (bRect.height / 8);
  const col = flipped ? (8 - fileNum) : (fileNum - 1);
  const row = flipped ? (rankNum - 1) : (8 - rankNum);

  return {
    x: fileX !== null ? fileX : (bRect.left + (col + 0.5) * sqW),
    y: rankY !== null ? rankY : (bRect.top + (row + 0.5) * sqH),
    width: sqW,
    height: sqH
  };
}

function collectAllElements(container) {
  if (!container) return [];
  const elements = new Set();

  // Fast path: query piece elements strictly from the active board container and its shadowRoot
  const roots = [container];
  if (container.shadowRoot) roots.push(container.shadowRoot);

  const pieceSelector = '.piece, [class*="piece"], [data-piece]';
  for (const root of roots) {
    try {
      if (root.querySelectorAll) {
        root.querySelectorAll(pieceSelector).forEach(el => elements.add(el));
      }
    } catch (_) {}
  }

  if (elements.size >= 2) {
    return Array.from(elements);
  }

  // Fallback: BFS traversal only if fast query didn't find pieces
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

  return Array.from(elements);
}

function extractFromPieces(board) {
  const rect = board.getBoundingClientRect();
  const flipped = isBoardFlipped(board);
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

/**
 * Checks if the board is visually flipped (Black pieces at bottom).
 * Tries multiple attribute/class patterns used by chess.com as well as rendered coordinates.
 */
export function isBoardFlipped(board) {
  if (!board) return false;

  // 1. Common class names
  if (board.classList.contains('flipped') ||
      board.classList.contains('board-flipped') ||
      board.classList.contains('reversed')) return true;

  // 2. Data/HTML attributes (chess.com web component may use these)
  const orientationAttr = board.getAttribute('data-orientation') ||
                          board.getAttribute('orientation') ||
                          board.getAttribute('board-orientation') ||
                          board.getAttribute('flipped');
  if (orientationAttr === 'black' || orientationAttr === '1' || orientationAttr === 'true') return true;
  if (orientationAttr === 'white' || orientationAttr === '0' || orientationAttr === 'false') return false;

  // 3. Parent element might carry the class
  if (board.parentElement?.classList?.contains('flipped') ||
      board.closest?.('[class*="flipped"]')) return true;

  // 4. Physical coordinates check (rendered rank numbers: '1' at top or '8' at bottom = flipped)
  const coords = board.querySelectorAll?.('.coordinate-light, .coordinate-dark, [class*="coordinate"], text.coordinate') || [];
  for (const c of coords) {
    const txt = (c.textContent || '').trim();
    if (txt === '1' || txt === '8') {
      const rect = c.getBoundingClientRect();
      const bRect = board.getBoundingClientRect();
      if (bRect.height > 0) {
        const relY = (rect.top + rect.height / 2 - bRect.top) / bRect.height;
        if (txt === '1' && relY < 0.35) return true;  // Rank 1 at top = Black perspective (flipped)
        if (txt === '8' && relY > 0.65) return true;  // Rank 8 at bottom = Black perspective (flipped)
        if (txt === '1' && relY > 0.65) return false; // Rank 1 at bottom = White perspective (normal)
        if (txt === '8' && relY < 0.35) return false; // Rank 8 at top = White perspective (normal)
      }
    }
  }

  return false;
}

/**
 * Returns the color of the user based on board orientation.
 * In Chess.com, the player at the bottom of the screen is ALWAYS the user.
 */
export function getUserColor(board = findBoardElement()) {
  return isBoardFlipped(board) ? 'b' : 'w';
}

/**
 * Checks which piece is standing on the destination square of the last move highlights.
 * The piece standing on the destination square is ALWAYS the piece that just moved!
 * If White piece moved -> now Black's turn ('b').
 * If Black piece moved -> now White's turn ('w').
 */
function detectTurnFromHighlightPiece(board) {
  const rawHighlights = board.querySelectorAll('.highlight, [class*="highlight"]');
  if (rawHighlights.length < 2) return null;

  const highlights = Array.from(rawHighlights);

  // Iterate highlights in reverse order (destination square is usually the most recent highlight in DOM)
  const candidatePieces = [];
  for (let i = highlights.length - 1; i >= 0; i--) {
    const h = highlights[i];
    const cls = String(h.getAttribute('class') || h.className || '');
    let sqStr = null;

    const mNum = cls.match(/square-0?([1-8])0?([1-8])/);
    if (mNum) {
      const file = parseInt(mNum[1], 10);
      const rank = parseInt(mNum[2], 10);
      sqStr = `${'abcdefgh'[file - 1]}${rank}`;
    } else {
      const mAlpha = cls.match(/square-([a-h])([1-8])/i);
      if (mAlpha) {
        sqStr = `${mAlpha[1].toLowerCase()}${mAlpha[2]}`;
      }
    }
    if (!sqStr) continue;

    // Use getPieceOnSquare which checks classes, data-square, and physical screen geometry
    const p = getPieceOnSquare(board, sqStr);
    if (p && isPieceAlive(p)) {
      const val = readPieceFromSquare(p);
      if (val) {
        const isWhite = val === val.toUpperCase();
        candidatePieces.push({ sqStr, val, isWhite });
      }
    }
  }

  if (candidatePieces.length > 0) {
    const moved = candidatePieces[0];
    const nextTurn = moved.isWhite ? 'b' : 'w';
    logger.info(`Turn detected from moved piece ${moved.val} on ${moved.sqStr} (${moved.isWhite ? 'White' : 'Black'} moved) → turn=${nextTurn}`);
    return nextTurn;
  }

  return null;
}

/**
 * Counts half-moves (plies) from the move list to determine turn.
 */
function detectTurnFromPlyCount() {
  const nodeSelectors = [
    'wc-move-list .node',
    'wc-vertical-move-list .node',
    '.node[data-node-index]',
    '.vertical-move-list .node',
    '.moves-list .node',
    '.move-list .node',
    '.move-list-v3 .node'
  ];

  for (const sel of nodeSelectors) {
    try {
      const rawNodes = document.querySelectorAll(sel);
      if (rawNodes.length > 0) {
        const moveNodes = Array.from(rawNodes).filter(n => {
          const txt = (n.textContent || '').trim();
          return !/^\d+\.?$/.test(txt);
        });
        if (moveNodes.length > 0) {
          const last = moveNodes[moveNodes.length - 1];
          if (last.classList.contains('white-node') || last.classList.contains('white')) return 'b';
          if (last.classList.contains('black-node') || last.classList.contains('black')) return 'w';

          const turn = moveNodes.length % 2 === 1 ? 'b' : 'w';
          logger.info(`Turn via ply count: sel="${sel}" count=${moveNodes.length} → turn=${turn}`);
          return turn;
        }
      }
    } catch (_) {}
  }
  return null;
}

function detectTurn(board) {
  // --- Method 1: Check piece standing on last move highlight (MOST ACCURATE) ---
  const highlightTurn = detectTurnFromHighlightPiece(board);
  if (highlightTurn) return highlightTurn;

  // --- Method 2: Ply count parity from move list ---
  const plyTurn = detectTurnFromPlyCount();
  if (plyTurn) return plyTurn;

  // --- Method 3: Clock highlight ---
  const flipped = isBoardFlipped(board);
  const bottomClockTurn = document.querySelector(
    '.clock-bottom.clock-player-turn, .clock-player-turn.clock-bottom, ' +
    '[class*="clock"][class*="bottom"][class*="turn"], [class*="clock"][class*="bottom"][class*="running"]'
  );
  const topClockTurn = document.querySelector(
    '.clock-top.clock-player-turn, .clock-player-turn.clock-top, ' +
    '[class*="clock"][class*="top"][class*="turn"], [class*="clock"][class*="top"][class*="running"]'
  );
  if (bottomClockTurn) return flipped ? 'b' : 'w';
  if (topClockTurn) return flipped ? 'w' : 'b';

  return 'w'; // Default fallback (White moves first)
}

/**
 * Infers castling rights from actual piece positions on the board.
 * Prevents sending illegal castling flags to Stockfish (e.g. King on g1 but Q-right set).
 */
function inferCastlingRights(placement) {
  const rows = placement.split('/');
  if (rows.length !== 8) return '-';

  function expandRank(s) {
    const arr = [];
    for (const c of s) {
      if (/^[1-8]$/.test(c)) for (let i = 0; i < parseInt(c, 10); i++) arr.push(null);
      else arr.push(c);
    }
    while (arr.length < 8) arr.push(null);
    return arr;
  }

  const r1 = expandRank(rows[7] || '');  // rank 1 = White's back rank
  const r8 = expandRank(rows[0] || '');  // rank 8 = Black's back rank

  let castling = '';
  // White: King must be on e1 (index 4)
  if (r1[4] === 'K') {
    if (r1[7] === 'R') castling += 'K';  // Rook on h1 → kingside
    if (r1[0] === 'R') castling += 'Q';  // Rook on a1 → queenside
  }
  // Black: King must be on e8 (index 4)
  if (r8[4] === 'k') {
    if (r8[7] === 'r') castling += 'k';  // Rook on h8 → kingside
    if (r8[0] === 'r') castling += 'q';  // Rook on a8 → queenside
  }

  return castling || '-';
}

/**
 * Detects en passant target square by comparing previous and current placement.
 * If a pawn moved from rank 2→4 (White) or 7→5 (Black), the EP square is the skipped rank.
 */
function inferEnPassant(prevPlacement, currPlacement, turn) {
  if (!prevPlacement || !currPlacement || prevPlacement === currPlacement) return '-';

  function expandBoard(placement) {
    const board = [];
    for (const rankStr of placement.split('/')) {
      const row = [];
      for (const c of rankStr) {
        if (/^[1-8]$/.test(c)) for (let i = 0; i < parseInt(c, 10); i++) row.push(null);
        else row.push(c);
      }
      board.push(row);
    }
    return board; // board[0] = rank8, board[7] = rank1
  }

  try {
    const prev = expandBoard(prevPlacement);
    const curr = expandBoard(currPlacement);
    const FILES = 'abcdefgh';

    if (turn === 'b') {
      // White just moved: check if a White pawn went from rank2 (board[6]) to rank4 (board[4])
      for (let col = 0; col < 8; col++) {
        if (prev[6][col] === 'P' && curr[4][col] === 'P' && curr[6][col] === null) {
          return `${FILES[col]}3`; // EP square is rank3 (the skipped square)
        }
      }
    } else {
      // Black just moved: check if a Black pawn went from rank7 (board[1]) to rank5 (board[3])
      for (let col = 0; col < 8; col++) {
        if (prev[1][col] === 'p' && curr[3][col] === 'p' && curr[1][col] === null) {
          return `${FILES[col]}6`; // EP square is rank6 (the skipped square)
        }
      }
    }
  } catch (_) {}

  return '-';
}


export function extractFEN(board = findBoardElement()) {
  if (!board) {
    lastDiagnostic = 'Board element not found';
    return null;
  }

  // 1. Extract directly from real DOM piece elements on the chessboard
  let placement = extractFromPieces(board);

  // 2. Fallback: iterate over squares 8x8
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
    logger.info('Could not extract board placement:', lastDiagnostic);
    return null;
  }

  const turn = detectTurn(board);
  const castling = inferCastlingRights(placement);
  const epSquare = inferEnPassant(_prevPlacement, placement, turn);
  _prevPlacement = placement;  // cập nhật cho lần tiếp
  const fen = `${placement} ${turn} ${castling} ${epSquare} 0 1`;
  logger.info(`FEN built: turn=${turn} castling=${castling} ep=${epSquare}`);

  if (!isValidFen(fen)) {
    lastDiagnostic = `Invalid FEN: ${fen.slice(0, 30)}...`;
    logger.info('Board state could not be validated:', fen);
    return null;
  }
  
  lastDiagnostic = 'OK';
  logger.info('[ChessMate] Successfully extracted FEN:', fen);
  return fen;
}
