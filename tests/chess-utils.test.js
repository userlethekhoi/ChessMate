import test from 'node:test';
import assert from 'node:assert/strict';
import { boardToPlacement, isValidFen, uciToSquares } from '../src/utils/chess-utils.js';
import { parsePieceText } from '../src/content/board-extractor.js';
import { SQUARE_SELECTORS } from '../src/utils/constants.js';

test('compresses board rows into placement', () => assert.equal(boardToPlacement([['r',null,null,null,'k',null,null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], [null,null,null,null,null,null,null,null], ['R',null,null,null,null,null,null,'K']]), 'r3k3/8/8/8/8/8/8/R6K'));
test('validates FEN basics', () => { assert.equal(isValidFen('8/8/8/8/8/8/8/K6k w - - 0 1'), true); assert.equal(isValidFen('bad w - - 0 1'), false); });
test('parses UCI', () => assert.deepEqual(uciToSquares('e7e8q'), { from:'e7', to:'e8', promotion:'q' }));

test('parses piece classes correctly', () => {
  assert.equal(parsePieceText('piece wk square-51'), 'K');
  assert.equal(parsePieceText('piece wq square-41'), 'Q');
  assert.equal(parsePieceText('piece wb square-31'), 'B');
  assert.equal(parsePieceText('piece wn square-21'), 'N');
  assert.equal(parsePieceText('piece wr square-11'), 'R');
  assert.equal(parsePieceText('piece wp square-52'), 'P');

  assert.equal(parsePieceText('piece bk square-58'), 'k');
  assert.equal(parsePieceText('piece bq square-48'), 'q');
  assert.equal(parsePieceText('piece bb square-38'), 'b');
  assert.equal(parsePieceText('piece bn square-28'), 'n');
  assert.equal(parsePieceText('piece br square-18'), 'r');
  assert.equal(parsePieceText('piece bp square-57'), 'p');
});

test('generates accurate Chess.com square selectors', () => {
  const e4Selectors = SQUARE_SELECTORS(4, 'e');
  assert.ok(e4Selectors.includes('.square-54'));
  const e2Selectors = SQUARE_SELECTORS(2, 'e');
  assert.ok(e2Selectors.includes('.square-52'));
});

