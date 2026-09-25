export class Overlay {
  constructor(board) {
    this.board = board;
    // Remove any existing overlay across document
    document.querySelectorAll('#chessmate-overlay-root').forEach(el => el.remove());

    this.root = document.createElement('div');
    this.root.id = 'chessmate-overlay-root';
    this.container = document.body;

    this.root.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999990;
      overflow: visible;
    `;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.style.cssText = 'position:absolute;width:100%;height:100%;top:0;left:0;overflow:visible;pointer-events:none;';
    this.root.append(this.svg);

    document.body.append(this.root);
    this.syncBounds();

    window.addEventListener('resize', () => this.syncBounds());
    window.addEventListener('scroll', () => this.syncBounds(), { passive: true });
  }

  syncBounds() {
    const b = this.board || document.querySelector('wc-chess-board, chess-board');
    if (!b || !this.root) return;
    this.board = b;
    const br = b.getBoundingClientRect();
    if (br.width === 0 || br.height === 0) return;

    this.root.style.position = 'fixed';
    this.root.style.left = `${br.left}px`;
    this.root.style.top = `${br.top}px`;
    this.root.style.width = `${br.width}px`;
    this.root.style.height = `${br.height}px`;
  }

  showArrow(uci, evaluation, depth) {
    if (!uci || uci.length < 4) return;
    this.syncBounds();

    const a = uci.slice(0, 2);
    const b = uci.slice(2, 4);
    const r = this.board.getBoundingClientRect();
    const flipped = this.board.classList.contains('flipped');

    const pos = s => {
      const file = s.charCodeAt(0) - 97;
      const rank = Number(s[1]) - 1;
      const col = flipped ? 7 - file : file;
      const row = flipped ? rank : 7 - rank;
      return {
        x: (col + 0.5) * (r.width / 8),
        y: (row + 0.5) * (r.height / 8)
      };
    };

    const p = pos(a);
    const q = pos(b);

    // Calculate arrow head polygon
    const angle = Math.atan2(q.y - p.y, q.x - p.x);
    const headLen = 24;
    const headAngle = Math.PI / 5.5; // ~33 deg
    const x1 = q.x - headLen * Math.cos(angle - headAngle);
    const y1 = q.y - headLen * Math.sin(angle - headAngle);
    const x2 = q.x - headLen * Math.cos(angle + headAngle);
    const y2 = q.y - headLen * Math.sin(angle + headAngle);
    const lineEndX = q.x - 14 * Math.cos(angle);
    const lineEndY = q.y - 14 * Math.sin(angle);

    // Semi-transparent arrow with delicate glow that will NEVER block or hide pieces underneath
    this.svg.innerHTML = `
      <defs>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <!-- Source circle -->
      <circle cx="${p.x}" cy="${p.y}" r="14" fill="#22c55e" opacity="0.45" filter="url(#cm-glow)"/>
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" opacity="0.85"/>
      <!-- Arrow shaft -->
      <line x1="${p.x}" y1="${p.y}" x2="${lineEndX}" y2="${lineEndY}" stroke="#22c55e" stroke-width="10" stroke-linecap="round" opacity="0.8" filter="url(#cm-glow)"/>
      <!-- Arrow tip -->
      <polygon points="${q.x},${q.y} ${x1},${y1} ${x2},${y2}" fill="#22c55e" opacity="0.85" filter="url(#cm-glow)"/>
    `;
  }

  clear() {
    this.svg.innerHTML = '';
  }

  destroy() {
    this.root?.remove();
    this.root = null;
  }
}
