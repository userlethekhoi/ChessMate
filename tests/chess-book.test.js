import test from 'node:test';
import assert from 'node:assert/strict';
import { identifyOpening, OPENINGS, TACTICAL_LESSONS } from '../src/ai/chess-book.js';

test('OPENINGS contains key classical chess openings', () => {
  assert.ok(OPENINGS.length >= 8);
  const names = OPENINGS.map(o => o.name);
  assert.ok(names.some(n => n.includes('Ruy Lopez')));
  assert.ok(names.some(n => n.includes('Sicilian')));
  assert.ok(names.some(n => n.includes('London')));
});

test('TACTICAL_LESSONS contains vital tactical patterns', () => {
  assert.ok(TACTICAL_LESSONS.length >= 6);
  const ids = TACTICAL_LESSONS.map(l => l.id);
  assert.ok(ids.includes('fork'));
  assert.ok(ids.includes('pin'));
  assert.ok(ids.includes('skewer'));
  assert.ok(ids.includes('perpetual_defense'));
});

test('identifyOpening accurately identifies Italian Game move sequence', () => {
  const moves = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'];
  const match = identifyOpening(moves);
  assert.ok(match);
  assert.ok(match.name.includes('Italian Game'));
});
