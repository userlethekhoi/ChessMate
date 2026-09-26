const FILES = 'abcdefgh';
export function boardToPlacement(board) {
  return board.map(row => { let out = '', empty = 0; for (const piece of row) { if (!piece) empty++; else { if (empty) { out += empty; empty = 0; } out += piece; } } return out + (empty || ''); }).join('/');
}
export function isValidPlacement(placement) {
  const ranks = placement.split('/'); if (ranks.length !== 8) return false;
  return ranks.every(rank => { let n = 0; for (const c of rank) { if (/^[1-8]$/.test(c)) n += Number(c); else if (/^[prnbqkPRNBQK]$/.test(c)) n++; else return false; } return n === 8; });
}
function hasValidKings(placement) {
  let whiteKings = 0;
  let blackKings = 0;
  for (const c of placement) {
    if (c === 'K') whiteKings++;
    else if (c === 'k') blackKings++;
  }
  return whiteKings === 1 && blackKings === 1;
}

export function isValidFen(fen) {
  const p = String(fen || '').trim().split(/\s+/);
  if (p.length < 2) return false;
  if (!isValidPlacement(p[0])) return false;
  if (!/^[wb]$/.test(p[1])) return false;
  if (!hasValidKings(p[0])) return false;
  if (p.length >= 3 && !/^(-|[KQkq]{1,4})$/.test(p[2])) return false;
  if (p.length >= 4 && !/^(-|[a-h][36])$/.test(p[3])) return false;
  return true;
}
export function uciToSquares(uci) { const m = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uci || ''); return m ? { from: m[1], to: m[2], promotion: m[3] } : null; }
export function squareToCoords(square, rect, flipped = false) { const file = FILES.indexOf(square[0]), rank = Number(square[1]) - 1; const x = flipped ? 7 - file : file, y = flipped ? rank : 7 - rank; return { x: rect.left + (x + .5) * rect.width / 8, y: rect.top + (y + .5) * rect.height / 8 }; }
