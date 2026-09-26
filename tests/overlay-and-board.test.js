import test from 'node:test';
import assert from 'node:assert/strict';
import { hasValidBoardPieces, findBoardElement, isBoardFlipped } from '../src/content/board-extractor.js';

test('hasValidBoardPieces rejects non-square layout containers', () => {
  // Mock rectangular container (e.g. .board-layout-main width 1000, height 540)
  const rectangularContainer = {
    getBoundingClientRect: () => ({ width: 1000, height: 540 }),
    querySelectorAll: () => [{}, {}, {}, {}]
  };
  assert.equal(hasValidBoardPieces(rectangularContainer), false, 'Should reject container with aspect ratio 1.85');

  // Mock rectangular sidebar (width 360, height 800)
  const sidebar = {
    getBoundingClientRect: () => ({ width: 360, height: 800 }),
    querySelectorAll: () => [{}, {}]
  };
  assert.equal(hasValidBoardPieces(sidebar), false, 'Should reject sidebar with aspect ratio 0.45');

  // Mock valid square chessboard (e.g. 500x500)
  const validSquareBoard = {
    getBoundingClientRect: () => ({ width: 500, height: 500 }),
    querySelectorAll: () => [{}, {}, {}]
  };
  assert.equal(hasValidBoardPieces(validSquareBoard), true, 'Should accept square chessboard');
});

test('findBoardElement prioritizes innermost square board over outer wrapper', () => {
  const outerWrapper = {
    tagName: 'DIV',
    className: 'board-layout-chessboard',
    getBoundingClientRect: () => ({ width: 510, height: 510 }),
    querySelectorAll: () => [{}, {}, {}, {}],
    querySelector: (sel) => sel.includes('wc-chess-board') ? innerBoard : null
  };

  const innerBoard = {
    tagName: 'WC-CHESS-BOARD',
    className: 'board',
    id: 'board-single',
    getBoundingClientRect: () => ({ width: 500, height: 500 }),
    querySelectorAll: () => [{}, {}, {}, {}],
    querySelector: () => null
  };

  const mockDoc = {
    querySelector: (sel) => {
      if (sel.includes('wc-chess-board')) return innerBoard;
      return null;
    },
    querySelectorAll: () => [outerWrapper, innerBoard]
  };

  const selected = findBoardElement(mockDoc);
  assert.equal(selected, innerBoard, 'Should select inner wc-chess-board');
});

test('Overlay percentage coordinate calculations are exact', () => {
  const getPos = (uciSquare, flipped) => {
    const file = uciSquare.charCodeAt(0) - 97;
    const rank = Number(uciSquare[1]) - 1;
    const col = flipped ? 7 - file : file;
    const row = flipped ? rank : 7 - rank;
    return {
      x: (col + 0.5) * 12.5,
      y: (row + 0.5) * 12.5
    };
  };

  // Normal orientation (White bottom)
  // a1 is bottom-left -> col 0, row 7 -> x: 6.25%, y: 93.75%
  assert.deepEqual(getPos('a1', false), { x: 6.25, y: 93.75 });
  // h8 is top-right -> col 7, row 0 -> x: 93.75%, y: 6.25%
  assert.deepEqual(getPos('h8', false), { x: 93.75, y: 6.25 });
  // e4 -> col 4, row 4 (rank 4 is index 3 -> row = 7 - 3 = 4) -> x: 56.25%, y: 56.25%
  assert.deepEqual(getPos('e4', false), { x: 56.25, y: 56.25 });
  // g1 -> col 6, row 7 -> x: 81.25%, y: 93.75%
  assert.deepEqual(getPos('g1', false), { x: 81.25, y: 93.75 });
  // f3 -> col 5, row 5 -> x: 68.75%, y: 68.75%
  assert.deepEqual(getPos('f3', false), { x: 68.75, y: 68.75 });

  // Flipped orientation (Black bottom)
  // a1 is top-right -> col 7, row 0 -> x: 93.75%, y: 6.25%
  assert.deepEqual(getPos('a1', true), { x: 93.75, y: 6.25 });
  // h8 is bottom-left -> col 0, row 7 -> x: 6.25%, y: 93.75%
  assert.deepEqual(getPos('h8', true), { x: 6.25, y: 93.75 });
});

test('getPieceOnSquare and getSquareCenter locate real DOM piece accurately', async () => {
  const { getPieceOnSquare, getSquareCenter } = await import('../src/content/board-extractor.js');

  const knightG1 = {
    className: 'piece wn square-71',
    getAttribute: (attr) => attr === 'class' ? 'piece wn square-71' : null,
    getBoundingClientRect: () => ({ left: 400, top: 450, width: 60, height: 60 })
  };

  const pawnE3 = {
    className: 'piece wp square-53',
    getAttribute: (attr) => attr === 'class' ? 'piece wp square-53' : null,
    getBoundingClientRect: () => ({ left: 280, top: 330, width: 60, height: 60 })
  };

  const pawnF2 = {
    className: 'piece wp square-62',
    getAttribute: (attr) => attr === 'class' ? 'piece wp square-62' : null,
    getBoundingClientRect: () => ({ left: 340, top: 390, width: 60, height: 60 })
  };

  const mockBoard = {
    classList: { contains: () => false },
    getAttribute: () => null,
    getBoundingClientRect: () => ({ left: 40, top: 30, width: 480, height: 480 }),
    querySelector: (sel) => {
      if (sel.includes('71') || sel.includes('g1')) return knightG1;
      if (sel.includes('53') || sel.includes('e3')) return pawnE3;
      if (sel.includes('62') || sel.includes('f2')) return pawnF2;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('piece')) return [knightG1, pawnE3, pawnF2];
      return [];
    }
  };

  // Test finding source piece on g1
  const foundPiece = getPieceOnSquare(mockBoard, 'g1');
  assert.equal(foundPiece, knightG1);

  // Test getting center of source piece on g1
  const centerG1 = getSquareCenter(mockBoard, 'g1');
  assert.deepEqual(centerG1, { x: 430, y: 480, width: 60, height: 60 });

  // Test getting center of target square f3 (empty square, intersected by file f and rank 3 pieces)
  const centerF3 = getSquareCenter(mockBoard, 'f3', centerG1, 'g1');
  // file f comes from pawnF2 (left 340, width 60 -> center 370)
  // rank 3 comes from pawnE3 (top 330, height 60 -> center 360)
  assert.equal(centerF3.x, 370);
  assert.equal(centerF3.y, 360);
});

