import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMaterial, evaluateMoveStrategy, PIECE_VALUES } from '../src/utils/board-evaluator.js';

test('PIECE_VALUES defines standard chess values accurately', () => {
  assert.equal(PIECE_VALUES.q, 9);
  assert.equal(PIECE_VALUES.r, 5);
  assert.equal(PIECE_VALUES.n, 3);
  assert.equal(PIECE_VALUES.p, 1);
  assert.equal(PIECE_VALUES.k, 0);
});

test('calculateMaterial accurately calculates starting position material', () => {
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const mat = calculateMaterial(startFen);
  assert.ok(mat);
  assert.equal(mat.whitePieces.q, 1);
  assert.equal(mat.whitePieces.r, 2);
  assert.equal(mat.whitePieces.p, 8);
  assert.equal(mat.diff, 0);
  assert.equal(mat.advantage, 'equal');
});

test('calculateMaterial accurately detects when White is up a Queen', () => {
  // Black has no Queen
  const fen = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const mat = calculateMaterial(fen);
  assert.ok(mat);
  assert.equal(mat.whitePieces.q, 1);
  assert.equal(mat.blackPieces.q, 0);
  assert.equal(mat.diff, 9);
  assert.equal(mat.advantage, 'w');
  assert.ok(mat.diffText.includes('Trắng hơn +9'));
});

test('evaluateMoveStrategy recognizes favorable piece capture (Bishop eats Queen)', () => {
  // White Bishop at f4 eats Black Queen at e5
  const fen = '8/8/8/4q3/5B2/8/8/4K2k w - - 0 1';
  const strat = evaluateMoveStrategy({
    fen,
    uci: 'f4e5',
    evaluation: 60.7,
    userColor: 'w'
  });

  assert.ok(strat);
  assert.equal(strat.type, 'material_gain');
  assert.ok(strat.badge.includes('ĂN CHẤT LỜI QUÂN'));
  assert.ok(strat.advice.includes('tiêu diệt Hậu'));
});

test('evaluateMoveStrategy advises simplification when ahead in material', () => {
  // White Queen at e4 trades with Black Queen at e5, White is already up a Rook
  const fen = '8/8/8/4q3/4Q3/8/8/R3K2k w - - 0 1';
  const strat = evaluateMoveStrategy({
    fen,
    uci: 'e4e5',
    evaluation: 8.5,
    userColor: 'w'
  });

  assert.ok(strat);
  assert.equal(strat.type, 'trade_simplify');
  assert.ok(strat.badge.includes('ĐỔI QUÂN ĐỂ THẮNG DỄ'));
  assert.ok(strat.advice.includes('triệt tiêu mọi khả năng phản công'));
});

test('evaluateMoveStrategy warns against disadvantageous trade when behind in material', () => {
  // Black is up material, White trades Queens
  const fen = 'r7/8/8/4q3/4Q3/8/8/4K2k w - - 0 1';
  const strat = evaluateMoveStrategy({
    fen,
    uci: 'e4e5',
    evaluation: -5.0,
    userColor: 'w'
  });

  assert.ok(strat);
  assert.equal(strat.type, 'trade_caution');
  assert.ok(strat.badge.includes('ĐỔI QUÂN ÉP BUỘC'));
});
