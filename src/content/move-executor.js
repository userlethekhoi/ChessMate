import { randomDelay, dispatchMouse, bezierCurve } from './human-simulator.js';
import { uciToSquares, squareToCoords } from '../utils/chess-utils.js';
import { SQUARE_SELECTORS } from '../utils/constants.js';

function findPieceAtSquare(board, name) {
  const rank = name[1], file = name[0];
  for (const s of SQUARE_SELECTORS(rank, file)) {
    const el = board.querySelector(s);
    if (el) return el;
  }
  return null;
}

export async function executeMove(board, uci, { delayMin = 800, delayMax = 2500 } = {}) {
  const parsed = uciToSquares(uci);
  if (!parsed) throw new Error('Invalid UCI move: ' + uci);

  const rect = board.getBoundingClientRect();
  const flipped = board.classList.contains('flipped');
  const startPos = squareToCoords(parsed.from, rect, flipped);
  const endPos = squareToCoords(parsed.to, rect, flipped);

  const pieceEl = findPieceAtSquare(board, parsed.from) || board;

  await randomDelay(delayMin, delayMax);

  // 1. Mouse down at start square
  dispatchMouse('mousedown', startPos.x, startPos.y, pieceEl);

  // 2. Realistic curved movement
  const steps = 8 + Math.floor(Math.random() * 8);
  for (const p of bezierCurve(startPos, endPos, steps)) {
    dispatchMouse('mousemove', p.x + (Math.random() * 4 - 2), p.y + (Math.random() * 4 - 2), document);
    await randomDelay(8, 25);
  }

  // 3. Mouse up at target square
  dispatchMouse('mouseup', endPos.x, endPos.y, board);

  // 4. Click fallback in case drag-drop is disabled
  await randomDelay(80, 160);
  dispatchMouse('click', startPos.x, startPos.y, pieceEl);
  await randomDelay(80, 160);
  dispatchMouse('click', endPos.x, endPos.y, board);

  // 5. Handle Pawn Promotion popup if Chess.com dialog appears
  if (parsed.promotion) {
    const promoPiece = parsed.promotion.toLowerCase(); // 'q', 'n', 'r', 'b'
    await randomDelay(150, 300);
    const promoSelectors = [
      `.promotion-piece.w${promoPiece}`,
      `.promotion-piece.b${promoPiece}`,
      `.promotion-piece.${promoPiece}`,
      `[data-piece="w${promoPiece}"]`,
      `[data-piece="b${promoPiece}"]`,
      `[data-piece="${promoPiece}"]`,
      `.promotion-window .${promoPiece}`,
      `.promotion-menu .${promoPiece}`
    ];
    for (const sel of promoSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const pRect = el.getBoundingClientRect();
        dispatchMouse('click', pRect.left + pRect.width / 2, pRect.top + pRect.height / 2, el);
        break;
      }
    }
  }

  return true;
}

