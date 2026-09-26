import { findBoardElement, getSquareCenter } from './board-extractor.js';

export class Overlay {
  constructor(board) {
    this.board = board;
    // Remove any existing overlay across document
    document.querySelectorAll('#chessmate-overlay-root').forEach(el => el.remove());

    this.root = document.createElement('div');
    this.root.id = 'chessmate-overlay-root';
    this.root.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999990;
      overflow: visible;
    `;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;overflow:visible;';
    this.root.append(this.svg);

    document.body.append(this.root);
    this.lastArrow = null;

    this.onResize = () => {
      this.syncSvgView();
      if (this.lastArrow) {
        this.showArrow(this.lastArrow.uci, this.lastArrow.evaluation, this.lastArrow.depth);
      }
    };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onResize, { passive: true });

    if (typeof ResizeObserver !== 'undefined' && this.board) {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.board);
    }
  }

  syncSvgView() {
    if (!this.svg) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.setAttribute('width', `${w}`);
    this.svg.setAttribute('height', `${h}`);
  }

  showArrow(uci, evaluation, depth) {
    if (!uci || uci.length < 4) return;
    this.lastArrow = { uci, evaluation, depth };

    const b = (this.board && this.board.isConnected) ? this.board : findBoardElement();
    if (!b) return;
    this.board = b;

    if (!document.body.contains(this.root)) {
      document.body.append(this.root);
    }
    this.syncSvgView();

    const fromSquare = uci.slice(0, 2);
    const toSquare = uci.slice(2, 4);

    // 1. Get real DOM center of starting piece
    const p = getSquareCenter(this.board, fromSquare);
    if (!p) return;

    // 2. Get real DOM center of target square (using real pieces/grid geometry)
    const q = getSquareCenter(this.board, toSquare, p, fromSquare);
    if (!q) return;

    // Calculate arrow dimensions based on actual square size on user's screen
    const sqSize = p.width || 60;
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const headLen = Math.max(16, Math.min(32, sqSize * 0.42));
    const headAngle = Math.PI / 5.5; // ~33 deg
    const x1 = q.x - headLen * Math.cos(angle - headAngle);
    const y1 = q.y - headLen * Math.sin(angle - headAngle);
    const x2 = q.x - headLen * Math.cos(angle + headAngle);
    const y2 = q.y - headLen * Math.sin(angle + headAngle);
    const lineEndX = q.x - (headLen * 0.45) * Math.cos(angle);
    const lineEndY = q.y - (headLen * 0.45) * Math.sin(angle);

    const circleRadius = Math.max(10, Math.min(22, sqSize * 0.28));
    const innerDotRadius = Math.max(3.5, Math.min(7, sqSize * 0.09));
    const strokeWidth = Math.max(6, Math.min(14, sqSize * 0.17));

    let promoBadgeHtml = '';
    let promoChar = uci.length === 5 ? uci[4].toLowerCase() : null;
    if (!promoChar && ((fromSquare[1] === '7' && toSquare[1] === '8') || (fromSquare[1] === '2' && toSquare[1] === '1'))) {
      promoChar = 'q';
    }

    if (promoChar) {
      const promoIcons = {
        q: { label: 'Phong Hậu', icon: '👑', color: '#c084fc' },
        n: { label: 'Phong Mã', icon: '♞', color: '#f59e0b' },
        r: { label: 'Phong Xe', icon: '♜', color: '#38bdf8' },
        b: { label: 'Phong Tượng', icon: '♝', color: '#34d399' }
      };
      const pInfo = promoIcons[promoChar] || promoIcons.q;
      const badgeY = q.y - sqSize * 0.48;
      promoBadgeHtml = `
        <g transform="translate(${q.x}, ${badgeY})" filter="url(#cm-glow)">
          <rect x="-44" y="-13" width="88" height="26" rx="13" fill="#0f172a" stroke="${pInfo.color}" stroke-width="2" opacity="0.96"/>
          <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
            ${pInfo.icon} ${pInfo.label}
          </text>
        </g>
      `;
    }

    // Semi-transparent luminous green arrow with delicate glow that NEVER obstructs pieces
    this.svg.innerHTML = `
      <defs>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <!-- Source piece center circle -->
      <circle cx="${p.x}" cy="${p.y}" r="${circleRadius}" fill="#22c55e" opacity="0.45" filter="url(#cm-glow)"/>
      <circle cx="${p.x}" cy="${p.y}" r="${innerDotRadius}" fill="#ffffff" opacity="0.9"/>
      <!-- Arrow shaft -->
      <line x1="${p.x}" y1="${p.y}" x2="${lineEndX}" y2="${lineEndY}" stroke="#22c55e" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="0.85" filter="url(#cm-glow)"/>
      <!-- Arrow tip polygon centered precisely on target square -->
      <polygon points="${q.x},${q.y} ${x1},${y1} ${x2},${y2}" fill="#22c55e" opacity="0.9" filter="url(#cm-glow)"/>
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('scroll', this.onResize);
    }
    this.root?.remove();
    this.root = null;
    this.board = null;
  }
}
