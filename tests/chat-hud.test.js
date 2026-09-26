import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('ChatHUD buttons do not contain brackets and render single clean glyphs', () => {
  const hudCode = fs.readFileSync(path.resolve('src/content/chat-hud.js'), 'utf8');

  // Verify [-] is replaced with -
  assert.strictEqual(hudCode.includes('title="Thu nhỏ">[-]'), false, 'Should not contain [-]');
  assert.strictEqual(hudCode.includes('title="Thu nhỏ">-</button>'), true, 'Should contain -');

  // Verify bubble button [-] is replaced with -
  assert.strictEqual(hudCode.includes('title="Thu thành bong bóng">[-]'), false, 'Should not contain [-]');
  assert.strictEqual(hudCode.includes('title="Thu thành bong bóng">-</button>'), true, 'Should contain -');

  // Verify [▼] is replaced with ▼
  assert.strictEqual(hudCode.includes('>[▼]</button>'), false, 'Should not contain [▼]');
  assert.strictEqual(hudCode.includes('>▼</button>'), true, 'Should contain ▼');

  // Verify [X] is replaced with ✕
  assert.strictEqual(hudCode.includes('>[X]</button>'), false, 'Should not contain [X]');
  assert.strictEqual(hudCode.includes('>✕</button>'), true, 'Should contain ✕');
});

test('Manifest declares src/offscreen/* in web_accessible_resources for mobile iframe support', () => {
  const manifest = JSON.parse(fs.readFileSync(path.resolve('manifest.json'), 'utf8'));
  const war = manifest.web_accessible_resources || [];
  const allResources = war.flatMap(w => w.resources);
  assert.ok(allResources.includes('src/offscreen/*'), 'Must include src/offscreen/*');
  assert.ok(allResources.includes('src/engine/*'), 'Must include src/engine/*');
});
