import { findBoardElement, isBoardFlipped } from './board-extractor.js';

export function getSquareBoardPos(square, flipped = false) {
  if (!square || square.length < 2) return null;
  const file = square[0].toLowerCase();
  const fileIdx = 'abcdefgh'.indexOf(file);
  const rank = parseInt(square[1], 10);
  if (fileIdx < 0 || isNaN(rank) || rank < 1 || rank > 8) return null;

  const rankIdx = rank - 1; // 0 to 7 (rank 1 = 0, rank 8 = 7)
  const col = flipped ? (7 - fileIdx) : fileIdx;
  const row = flipped ? rankIdx : (7 - rankIdx);

  return {
    x: (col + 0.5) * 100, // 800x800 viewBox: col 0 is 50, col 7 is 750
    y: (row + 0.5) * 100
  };
}

export class Overlay {
  constructor(board) {
    this.board = board;
    this.lastArrow = null;

    // Remove any existing overlay across document
    document.querySelectorAll('#chessmate-board-svg, #chessmate-overlay-root').forEach(el => el.remove());

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.id = 'chessmate-board-svg';
    this.svg.setAttribute('viewBox', '0 0 800 800');
    this.svg.setAttribute('preserveAspectRatio', 'none');
    this.svg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      overflow: visible;
    `;

    this.ensureAttached();
  }

  ensureAttached() {
    const b = (this.board && this.board.isConnected) ? this.board : findBoardElement();
    if (!b) return false;
    this.board = b;

    try {
      if (typeof window !== 'undefined') {
        const pos = window.getComputedStyle(b).position;
        if (pos === 'static') {
          b.style.position = 'relative';
        }
      }
    } catch (_) {}

    if (this.svg.parentElement !== b) {
      b.appendChild(this.svg);
    }
    return true;
  }

  showArrow(uci, evaluation, depth) {
    if (!uci || uci.length < 4) return;
    this.lastArrow = { uci, evaluation, depth };

    if (!this.ensureAttached()) return;

    const fromSquare = uci.slice(0, 2);
    const toSquare = uci.slice(2, 4);
    const flipped = isBoardFlipped(this.board);

    const p = getSquareBoardPos(fromSquare, flipped);
    const q = getSquareBoardPos(toSquare, flipped);
    if (!p || !q) return;

    // Arrow geometry in 800x800 board coordinate space
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const headLen = 36;
    const headAngle = Math.PI / 5.5; // ~33 degrees
    const x1 = q.x - headLen * Math.cos(angle - headAngle);
    const y1 = q.y - headLen * Math.sin(angle - headAngle);
    const x2 = q.x - headLen * Math.cos(angle + headAngle);
    const y2 = q.y - headLen * Math.sin(angle + headAngle);
    const lineEndX = q.x - (headLen * 0.45) * Math.cos(angle);
    const lineEndY = q.y - (headLen * 0.45) * Math.sin(angle);

    const circleRadius = 24;
    const innerDotRadius = 7.5;
    const strokeWidth = 14;

    let promoBadgeHtml = '';
    let promoChar = uci.length === 5 ? uci[4].toLowerCase() : null;
    if (!promoChar && ((fromSquare[1] === '7' && toSquare[1] === '8') || (fromSquare[1] === '2' && toSquare[1] === '1'))) {
      promoChar = 'q';
    }

    if (promoChar) {
      const promoLabels = {
        q: { label: 'PHONG HẬU', color: '#c084fc' },
        n: { label: 'PHONG MÃ', color: '#f59e0b' },
        r: { label: 'PHONG XE', color: '#38bdf8' },
        b: { label: 'PHONG TƯỢNG', color: '#34d399' }
      };
      const pInfo = promoLabels[promoChar] || promoLabels.q;
      const badgeY = q.y + (flipped ? 46 : -46);
      promoBadgeHtml = `
        <g transform="translate(${q.x}, ${badgeY})" filter="url(#cm-glow)">
          <rect x="-48" y="-14" width="96" height="28" rx="4" fill="#0f172a" stroke="${pInfo.color}" stroke-width="2" opacity="0.96"/>
          <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700" letter-spacing="0.5px" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
            ${pInfo.label}
          </text>
        </g>
      `;
    }

    this.svg.innerHTML = `
      <defs>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="3" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
      </defs>
      <!-- Source piece center circle -->
      <circle cx="${p.x}" cy="${p.y}" r="${circleRadius}" fill="#22c55e" opacity="0.45" filter="url(#cm-glow)"/>
      <circle cx="${p.x}" cy="${p.y}" r="${innerDotRadius}" fill="#ffffff" opacity="0.95"/>
      <!-- Arrow shaft -->
      <line x1="${p.x}" y1="${p.y}" x2="${lineEndX}" y2="${lineEndY}" stroke="#22c55e" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="0.88" filter="url(#cm-glow)"/>
      <!-- Arrow tip polygon centered precisely on target square -->
      <polygon points="${q.x},${q.y} ${x1},${y1} ${x2},${y2}" fill="#22c55e" opacity="0.92" filter="url(#cm-glow)"/>
      <!-- Promotion Badge if pawn reaches last rank -->
      ${promoBadgeHtml}
    `;
  }

  clear() {
    this.lastArrow = null;
    this.svg.innerHTML = '';
  }

  destroy() {
    this.lastArrow = null;
    this.svg?.remove();
    this.svg = null;
    this.board = null;
  }
}

