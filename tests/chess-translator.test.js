import test from 'node:test';
import assert from 'node:assert/strict';
import { translateMoveToVietnamese, fenToBoard, formatEvaluationVi, formatEvaluationParts } from '../src/utils/chess-translator.js';

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

test('formatEvaluationParts cleanly splits numeric chip and description', () => {
  const parts1 = formatEvaluationParts(60.7);
  assert.equal(parts1.numeric, '+60.7');
  assert.ok(parts1.desc.includes('Trắng ưu thế'));

  const parts2 = formatEvaluationParts(-3.2);
  assert.equal(parts2.numeric, '-3.2');
  assert.ok(parts2.desc.includes('Đen ưu thế'));

  const partsMate = formatEvaluationParts('#3');
  assert.equal(partsMate.numeric, '+M3');
  assert.ok(partsMate.desc.includes('chiếu hết'));
});

test('translateMoveToVietnamese handles all Promotion cases (Queen, Knight, Rook, Bishop, Capture)', () => {
  // 1. Queen promotion
  const fen1 = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
  const resQ = translateMoveToVietnamese('e7e8q', fen1);
  assert.equal(resQ.promotion, 'q');
  assert.equal(resQ.promoName, 'Hậu');
  assert.ok(resQ.title.includes('Phong Hậu'));

  // 2. Knight underpromotion (Fork or Check)
  const resN = translateMoveToVietnamese('e7e8n', fen1);
  assert.equal(resN.promotion, 'n');
  assert.equal(resN.promoName, 'Mã');
  assert.ok(resN.title.includes('Phong Mã'));
  assert.ok(resN.desc.includes('Underpromotion'));

  // 3. Rook underpromotion (Avoid stalemate)
  const resR = translateMoveToVietnamese('e7e8r', fen1);
  assert.equal(resR.promotion, 'r');
  assert.equal(resR.promoName, 'Xe');
  assert.ok(resR.title.includes('Phong Xe'));
  assert.ok(resR.desc.includes('bẫy Pat'));

  // 4. Bishop underpromotion
  const resB = translateMoveToVietnamese('e7e8b', fen1);
  assert.equal(resB.promotion, 'b');
  assert.equal(resB.promoName, 'Tượng');
  assert.ok(resB.title.includes('Phong Tượng'));

  // 5. Capture + Promotion (d7xe8=Q where e8 has a black rook 'r')
  // Rank 8: 4 squares empty (a8..d8), 'r' on e8, 3 squares empty (f8..h8) -> '4r3'
  // Rank 7: 3 squares empty (a7..c7), 'P' on d7, 4 squares empty (e7..h7) -> '3P4'
  const fenCapture = '4r3/3P4/8/8/8/8/8/4K2k w - - 0 1';
  const resCapture = translateMoveToVietnamese('d7e8q', fenCapture);
  assert.equal(resCapture.promotion, 'q');
  assert.ok(resCapture.title.includes('ăn Xe tại ô E8 -> Phong Hậu'));
  assert.equal(resCapture.short, 'D7xE8=Q');

  // 6. Auto-detect pawn reaching 8th rank without 5th char
  const resAuto = translateMoveToVietnamese('e7e8', fen1);
  assert.equal(resAuto.promotion, 'q');
  assert.ok(resAuto.title.includes('Phong Hậu'));
});
