import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMoveDirectness, selectShortestAndMostDirectMove } from '../src/engine/move-optimizer.js';

test('evaluateMoveDirectness gives higher priority to capturing high-value Queen over normal push', () => {
  // White Bishop at f4, Black Queen at e5
  const fen = '8/8/8/4q3/5B2/8/8/4K2k w - - 0 1';
  const bishopTakesQueen = evaluateMoveDirectness('f4e5', fen);
  const kingMove = evaluateMoveDirectness('e1f2', fen);

  assert.ok(bishopTakesQueen > kingMove);
  assert.ok(bishopTakesQueen >= 18); // 9 * 2 = 18 + bonus
});

test('selectShortestAndMostDirectMove strictly chooses the fastest checkmate path (Mate in 1 over Mate in 3)', () => {
  const candidates = [
    { move: 'f3f7', mateIn: 3, evaluation: '#3', pv: ['f3f7', 'e8d8', 'f7f8'] },
    { move: 'f3f8', mateIn: 1, evaluation: '#1', pv: ['f3f8'] }, // Shortest checkmate
    { move: 'c3d5', mateIn: 4, evaluation: '#4', pv: ['c3d5'] }
  ];

  const optimal = selectShortestAndMostDirectMove({
    candidates,
    defaultBestMove: 'f3f7',
    fen: 'r4k2/5p2/8/8/8/2N2Q2/8/4K3 w - - 0 1',
    userColor: 'w'
  });

  assert.equal(optimal.move, 'f3f8');
  assert.equal(optimal.mateIn, 1);
  assert.ok(optimal.efficiencyNote.includes('CHIẾU HẾT NHANH NHẤT'));
});

test('selectShortestAndMostDirectMove picks direct capture when evaluations are close', () => {
  // White has Bishop at f4 and Black Queen at e5.
  // Candidate 1: Bishop takes Queen (Direct capture +4.8)
  // Candidate 2: Quiet move h2h3 (+4.9)
  const fen = '8/8/8/4q3/5B2/8/7P/4K2k w - - 0 1';
  const candidates = [
    { move: 'h2h3', evaluation: 4.9, mateIn: null, pv: ['h2h3'] },
    { move: 'f4e5', evaluation: 4.8, mateIn: null, pv: ['f4e5'] }
  ];

  const optimal = selectShortestAndMostDirectMove({
    candidates,
    defaultBestMove: 'h2h3',
    fen,
    userColor: 'w'
  });

  assert.equal(optimal.move, 'f4e5'); // Preferred because it's direct and eliminates the Queen immediately
  assert.ok(optimal.efficiencyNote.includes('ĐÒN ĐÁNH TRỰC DIỆN'));
});
