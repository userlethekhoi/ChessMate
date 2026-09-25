import test from 'node:test';
import assert from 'node:assert/strict';
import { translateMoveToVietnamese, fenToBoard, formatEvaluationVi } from '../src/utils/chess-translator.js';

test('fenToBoard correctly parses starting position', () => {
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const board = fenToBoard(fen);
  assert.equal(board.length, 8);
  assert.equal(board[0][0], 'r');
  assert.equal(board[7][4], 'K');
  assert.equal(board[7][3], 'Q');
});

test('translateMoveToVietnamese describes Bishop move like c4 to c5', () => {
  // Setup FEN with a white bishop on c4
  const fen = 'rnbqkbnr/pppppppp/8/8/2B5/8/PPPPPPPP/RNBQK1NR w KQkq - 0 1';
  const result = translateMoveToVietnamese('c4c5', fen);
  assert.equal(result.title, 'Tượng ở ô C4 di chuyển qua C5');
  assert.ok(result.short.includes('Tượng C4'));
  assert.ok(result.piece.includes('Tượng'));
});

test('translateMoveToVietnamese handles capture move correctly', () => {
  // Knight at f3 takes pawn at e5
  const fen = 'rnbqkbnr/pppp1ppp/8/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2';
  const result = translateMoveToVietnamese('f3e5', fen);
  assert.ok(result.title.includes('Mã ở ô F3 ăn Tốt'));
  assert.ok(result.title.includes('tại ô E5'));
  assert.ok(result.short.includes('x'));
});

test('translateMoveToVietnamese handles Castling', () => {
  const fen = 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
  const resultWhite = translateMoveToVietnamese('e1g1', fen);
  assert.ok(resultWhite.title.includes('Nhập thành gần'));
});

test('translateMoveToVietnamese handles Promotion', () => {
  const fen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
  const result = translateMoveToVietnamese('e7e8q', fen);
  assert.ok(result.title.includes('Phong Hậu'));
});

test('formatEvaluationVi produces descriptive evaluation', () => {
  assert.ok(formatEvaluationVi(999).includes('CHIẾU HẾT'));
  assert.ok(formatEvaluationVi(2.45).includes('Trắng ưu thế'));
  assert.ok(formatEvaluationVi(-2.1).includes('Đen ưu thế'));
  assert.ok(formatEvaluationVi(0.1).includes('Cân bằng'));
});
