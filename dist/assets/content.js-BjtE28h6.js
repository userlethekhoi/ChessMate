import{a as e,i as t,n,r,t as i}from"./config-manager-MOj5odmI.js";import{n as a,t as o}from"./thinking-modes-zB3v2kIJ.js";import{n as s,t as c}from"./engine-manager-Cq40Kxk2.js";var l=`abcdefgh`;function u(e){return e.map(e=>{let t=``,n=0;for(let r of e)r?(n&&=(t+=n,0),t+=r):n++;return t+(n||``)}).join(`/`)}function d(e){let t=e.split(`/`);return t.length===8&&t.every(e=>{let t=0;for(let n of e)if(/^[1-8]$/.test(n))t+=Number(n);else if(/^[prnbqkPRNBQK]$/.test(n))t++;else return!1;return t===8})}function f(e){let t=String(e||``).trim().split(/\s+/);return t.length>=2&&d(t[0])&&/^[wb]$/.test(t[1])}function p(e){let t=/^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(e||``);return t?{from:t[1],to:t[2],promotion:t[3]}:null}function m(e,t,n=!1){let r=l.indexOf(e[0]),i=Number(e[1])-1,a=n?7-r:r,o=n?i:7-i;return{x:t.left+(a+.5)*t.width/8,y:t.top+(o+.5)*t.height/8}}var h=``,g={king:`k`,queen:`q`,rook:`r`,bishop:`b`,knight:`n`,horse:`n`,pawn:`p`};function _(e,t=null){e=String(e||``).toLowerCase();let n=e.match(/\b([wb])([kqrbnp])\b/);if(n){let[,e,t]=n;return e===`w`?t.toUpperCase():t.toLowerCase()}if(t){let e=`${t.style?.backgroundImage||(typeof window<`u`?window.getComputedStyle(t).backgroundImage:``)||``} ${t.src||t.getAttribute?.(`src`)||``}`.toLowerCase().match(/\/([wb])([kqrbnp])\.(?:png|svg|webp)/i);if(e){let[,t,n]=e;return t===`w`?n.toUpperCase():n.toLowerCase()}}let r=/white|\bwp\b|\bwr\b|\bwn\b|\bwb\b|\bwq\b|\bwk\b/.test(e),i=/black|\bbp\b|\bbr\b|\bbn\b|\bbb\b|\bbq\b|\bbk\b/.test(e);if(!r&&!i)return null;for(let[t,n]of Object.entries(g))if(e.includes(t))return r?n.toUpperCase():n.toLowerCase();return null}function v(e){return e?_(`${String(e.className||e.getAttribute?.(`class`)||``)} ${e.getAttribute?.(`data-piece`)||``} ${e.getAttribute?.(`aria-label`)||``}`,e):null}function y(e=document){let n=e.querySelector(`wc-chess-board, chess-board`);if(n&&n.getBoundingClientRect().width>120)return n;for(let n of t){let t=e.querySelector(n);if(t&&t.getBoundingClientRect().width>120)return t}let r=e.querySelector(`.piece, [class*="piece"], [data-piece]`);if(r){let e=r.closest(`wc-chess-board, chess-board, .board, [id*="board"], [class*="board"]`)||r.parentElement;if(e&&e.getBoundingClientRect().width>120)return e}let i=e.querySelectorAll(`[id*="board"], [class*="board"], [class*="chessboard"]`);for(let e of i){let t=e.getBoundingClientRect();if(t.width>180&&t.height>180&&Math.abs(t.width-t.height)<50)return e}return null}function b(t,n,r){for(let i of e(n,r)){let e=t.querySelector(i)||t.shadowRoot?.querySelector(i);if(e)return e}return null}function x(e){let t=String(e.getAttribute?.(`class`)||e.className||``).toLowerCase();return!(t.includes(`captured`)||t.includes(`ghost`)||t.includes(`dragging-source`)||e.style?.display===`none`||e.style?.visibility===`hidden`)}function S(e,t,n){let r=[String(e.getAttribute?.(`class`)||e.className||``),String(e.parentElement?.getAttribute?.(`class`)||e.parentElement?.className||``),String(e.getAttribute?.(`data-square`)||``),String(e.parentElement?.getAttribute?.(`data-square`)||``)].join(` `),i=r.match(/square-0?([1-8])0?([1-8])/);if(i){let e=parseInt(i[1],10),t=parseInt(i[2],10);return{fileIdx:e-1,rankIdx:8-t}}let a=r.match(/square-([a-h])([1-8])/i);if(a)return{fileIdx:`abcdefgh`.indexOf(a[1].toLowerCase()),rankIdx:8-parseInt(a[2],10)};if(t?.width&&t?.height){let r=e.getBoundingClientRect();if(r.width>5&&r.height>5){let e=r.left+r.width/2,i=r.top+r.height/2;if(e>=t.left-10&&e<=t.right+10&&i>=t.top-10&&i<=t.bottom+10){let r=Math.max(0,Math.min(7,Math.floor((e-t.left)/t.width*8))),a=Math.max(0,Math.min(7,Math.floor((i-t.top)/t.height*8)));return n&&(r=7-r,a=7-a),{fileIdx:r,rankIdx:a}}}}return null}function C(e=document){let t=new Set,n=[e],r=new Set;for(;n.length>0;){let e=n.shift();if(e&&!r.has(e)&&(r.add(e),e instanceof Element&&(t.add(e),e.shadowRoot&&!r.has(e.shadowRoot)&&n.push(e.shadowRoot)),e.children))for(let t=0;t<e.children.length;t++)n.push(e.children[t])}for(document.querySelectorAll(`wc-chess-board, chess-board, .board, #board-single`).forEach(e=>{r.has(e)||n.push(e),e.shadowRoot&&!r.has(e.shadowRoot)&&n.push(e.shadowRoot)});n.length>0;){let e=n.shift();if(e&&!r.has(e)&&(r.add(e),e instanceof Element&&(t.add(e),e.shadowRoot&&!r.has(e.shadowRoot)&&n.push(e.shadowRoot)),e.children))for(let t=0;t<e.children.length;t++)n.push(e.children[t])}return Array.from(t)}function w(e){let t=e.getBoundingClientRect(),n=e.classList.contains(`flipped`),r=C(e),i=Array.from({length:8},()=>Array(8).fill(null)),a=0;for(let e of r){if(!x(e))continue;let r=v(e);if(!r)continue;let o=S(e,t,n);if(!o)continue;let{fileIdx:s,rankIdx:c}=o;s>=0&&s<8&&c>=0&&c<8&&(i[c][s]=r,a++)}return h=`Scanned ${r.length} els, found ${a} pieces`,s.info(`[ChessMate] ${h}`),a>=2?u(i):null}function T(e){let t=e.querySelectorAll(`.highlight, [class*="highlight"]`);if(t.length>=2)for(let e of t){let t=String(e.getAttribute(`class`)||e.className||``).match(/square-0?([1-8])0?([1-8])/);if(t){let e=parseInt(t[2],10);if(e>=7)return`w`;if(e<=2)return`b`}}let n=e.classList.contains(`flipped`),r=document.querySelector(`.clock-bottom.clock-player-turn, .clock-player-turn.clock-bottom`),i=document.querySelector(`.clock-top.clock-player-turn, .clock-player-turn.clock-top`);if(r)return n?`b`:`w`;if(i)return n?`w`:`b`;let a=document.querySelectorAll(`.move-list-item, .move-node, [data-whole-move-number]`);if(a.length>0){let e=a[a.length-1];if(e.classList.contains(`black`)||e.closest(`.black`))return`w`;if(e.classList.contains(`white`)||e.closest(`.white`))return`b`}return`w`}function E(e){let t=[e,document.querySelector(`wc-chess-board`),document.querySelector(`chess-board`)];for(let e of t)if(e)try{if(typeof e.game?.getFEN==`function`){let t=e.game.getFEN();if(f(t))return t}if(typeof e.getFEN==`function`){let t=e.getFEN();if(f(t))return t}if(e.fen&&f(e.fen))return e.fen;if(e.dataset?.fen&&f(e.dataset.fen))return e.dataset.fen}catch{}return null}function D(e=y()){if(!e)return h=`Board element not found`,null;let t=E(e);if(t)return h=`OK (game API)`,s.info(`[ChessMate] Extracted FEN from game API:`,t),t;let n=w(e);if(!n){let t=[],r=!1;for(let n=8;n>=1;n--){let i=[];for(let t of`abcdefgh`){let a=v(b(e,n,t));a&&(r=!0),i.push(a)}t.push(i)}r&&(n=u(t))}if(!n)return s.warn(`[ChessMate] Could not extract board placement:`,h),null;let r=T(e),i=`${n} ${r} KQkq - 0 1`;return f(i)?(h=`OK`,s.info(`[ChessMate] Successfully extracted FEN:`,i),i):(h=`Invalid FEN: ${i.slice(0,30)}...`,s.warn(`[ChessMate] Board state could not be validated:`,i),null)}var O=class{constructor(){this.listeners=new Map,this.lastFEN=null,this.timer=null,this.observer=null,this.board=null}on(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>this.listeners.get(e)?.delete(t)}emit(e,t){this.listeners.get(e)?.forEach(e=>{try{e(t)}catch(e){s.error(e)}})}getLastDiagnostic(){return h}getCurrentFEN(){return D(this.board||y())}start(e=null){if(this.board=e||y(),!this.board){let e=0,t=()=>{this.board=y(),this.board?this.initObserver():e++<8&&setTimeout(t,150*2**e)};setTimeout(t,150);return}this.initObserver()}initObserver(){this.board&&(this.stop(),this.observer=new MutationObserver(e=>{this.board&&e.some(e=>this.board.contains(e.target))&&(clearTimeout(this.timer),this.timer=setTimeout(()=>this.check(),120))}),this.observer.observe(this.board,{childList:!0,subtree:!0,attributes:!0,attributeFilter:[`class`,`style`]}),setTimeout(()=>this.check(!0),200))}check(e=!1){if(document.visibilityState===`hidden`)return;let t=this.getCurrentFEN();if(!t||!e&&t===this.lastFEN)return;let n=this.lastFEN;this.lastFEN=t,this.emit(`move-detected`,{fen:t,previous:n,board:this.board}),this.emit(`turn-changed`,t.split(` `)[1])}forceCheck(){this.check(!0)}stop(){this.observer?.disconnect(),clearTimeout(this.timer),this.observer=null}},k=class{constructor(e){this.board=e,document.querySelectorAll(`#chessmate-overlay-root`).forEach(e=>e.remove()),this.root=document.createElement(`div`),this.root.id=`chessmate-overlay-root`,this.container=document.body,this.root.style.cssText=`
      position: fixed;
      pointer-events: none;
      z-index: 999990;
      overflow: visible;
    `,this.svg=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`),this.svg.style.cssText=`position:absolute;width:100%;height:100%;top:0;left:0;overflow:visible;pointer-events:none;`,this.root.append(this.svg),document.body.append(this.root),this.syncBounds(),window.addEventListener(`resize`,()=>this.syncBounds()),window.addEventListener(`scroll`,()=>this.syncBounds(),{passive:!0})}syncBounds(){let e=this.board||document.querySelector(`wc-chess-board, chess-board`);if(!e||!this.root)return;this.board=e;let t=e.getBoundingClientRect();t.width!==0&&t.height!==0&&(this.root.style.position=`fixed`,this.root.style.left=`${t.left}px`,this.root.style.top=`${t.top}px`,this.root.style.width=`${t.width}px`,this.root.style.height=`${t.height}px`)}showArrow(e,t,n){if(!e||e.length<4)return;this.syncBounds();let r=e.slice(0,2),i=e.slice(2,4),a=this.board.getBoundingClientRect(),o=this.board.classList.contains(`flipped`),s=e=>{let t=e.charCodeAt(0)-97,n=Number(e[1])-1,r=o?7-t:t,i=o?n:7-n;return{x:(r+.5)*(a.width/8),y:(i+.5)*(a.height/8)}},c=s(r),l=s(i),u=Math.atan2(l.y-c.y,l.x-c.x),d=Math.PI/5.5,f=l.x-24*Math.cos(u-d),p=l.y-24*Math.sin(u-d),m=l.x-24*Math.cos(u+d),h=l.y-24*Math.sin(u+d),g=l.x-14*Math.cos(u),_=l.y-14*Math.sin(u);this.svg.innerHTML=`
      <defs>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <!-- Source circle -->
      <circle cx="${c.x}" cy="${c.y}" r="14" fill="#22c55e" opacity="0.45" filter="url(#cm-glow)"/>
      <circle cx="${c.x}" cy="${c.y}" r="5" fill="#ffffff" opacity="0.85"/>
      <!-- Arrow shaft -->
      <line x1="${c.x}" y1="${c.y}" x2="${g}" y2="${_}" stroke="#22c55e" stroke-width="10" stroke-linecap="round" opacity="0.8" filter="url(#cm-glow)"/>
      <!-- Arrow tip -->
      <polygon points="${l.x},${l.y} ${f},${p} ${m},${h}" fill="#22c55e" opacity="0.85" filter="url(#cm-glow)"/>
    `}clear(){this.svg.innerHTML=``}destroy(){this.root?.remove(),this.root=null}},A={p:`Tốt`,n:`Mã`,b:`Tượng`,r:`Xe`,q:`Hậu`,k:`Vua`};function j(e){let t=String(e||``).trim().split(/\s+/)[0].split(`/`);if(t.length!==8)return null;let n=[];for(let e of t){let t=[];for(let n of e)if(/^[1-8]$/.test(n))for(let e=0;e<parseInt(n,10);e++)t.push(null);else t.push(n);if(t.length!==8)return null;n.push(t)}return n}function M(e){if(!e||e.length<2)return null;let t=`abcdefgh`.indexOf(e[0].toLowerCase()),n=parseInt(e[1],10);return t<0||t>7||n<1||n>8?null:{row:8-n,col:t}}function N(e,t=null){if(!e||e.length<4)return{title:e||`Chưa có nước đi`,desc:``,piece:``};let n=e.slice(0,2).toLowerCase(),r=e.slice(2,4).toLowerCase(),i=e[4]?.toLowerCase(),a=n.toUpperCase(),o=r.toUpperCase(),s=t?j(t):null,c=null,l=null;if(s){let e=M(n),t=M(r);e&&(c=s[e.row][e.col]),t&&(l=s[t.row][t.col])}let u=c?c.toLowerCase():null,d=u&&A[u]||`Quân cờ`;if(u===`k`){if(n===`e1`&&r===`g1`)return{title:`Nhập thành gần (O-O)`,short:`O-O (Cánh Vua)`,piece:`Vua`,desc:`Đưa Vua Trắng vào vị trí an toàn và kích hoạt Xe h1 ra trung tâm`};if(n===`e1`&&r===`c1`)return{title:`Nhập thành xa (O-O-O)`,short:`O-O-O (Cánh Hậu)`,piece:`Vua`,desc:`Bảo vệ Vua Trắng và chuyển Xe a1 tham chiến mạnh mẽ`};if(n===`e8`&&r===`g8`)return{title:`Nhập thành gần (O-O)`,short:`O-O (Cánh Vua)`,piece:`Vua`,desc:`Đưa Vua Đen vào vị trí phòng thủ vững vàng`};if(n===`e8`&&r===`c8`)return{title:`Nhập thành xa (O-O-O)`,short:`O-O-O (Cánh Hậu)`,piece:`Vua`,desc:`Đưa Vua Đen sang cánh Hậu và mở đường phản công`}}if(i){let e={q:`Hậu`,r:`Xe`,b:`Tượng`,n:`Mã`}[i]||`Hậu`;return{title:`${d} ở ô ${a} tiến lên ${o} (Phong ${e})`,short:`${d} ${a} -> ${o}=${i.toUpperCase()}`,piece:d,desc:`Tiến Tốt xuống hàng cuối và phong cấp thành ${e} uy lực`}}if(l){let e=A[l.toLowerCase()]||`quân đối phương`;return{title:`${d} ở ô ${a} ăn ${e} tại ô ${o}`,short:`${d} ${a} x ${o}`,piece:d,desc:`Tiêu diệt ${e} đối phương tại ${o}, chiếm lĩnh vị trí chiến lược`}}let f=`di chuyển đến`,p=`Kiểm soát ô ${o} và gia tăng ảnh hưởng`;return u===`p`?(f=`tiến lên`,p=`Củng cố trung tâm và mở rộng không gian cho các quân nhẹ`):u===`n`?(f=`nhảy đến`,p=`Đưa Mã vào tiền đồn mạnh mẽ, uy hiếp các vị trí trọng yếu`):u===`b`?(f=`di chuyển qua`,p=`Chiếm giữ đường chéo kiểm soát cánh và ghim quân đối thủ`):u===`r`?(f=`chuyển sang`,p=`Chiếm cột mở và sẵn sàng phối hợp dồn ép hàng ngang`):u===`q`?(f=`tiến ra`,p=`Tung Hậu vào vị trí uy lực, sẵn sàng mở đòn phối hợp`):u===`k`&&(f=`bước sang`,p=`Cải thiện vị trí Vua và tránh nguy hiểm`),{title:`${d} ở ô ${a} ${f} ${o}`,short:`${d} ${a} -> ${o}`,piece:d,desc:p}}function P(e){if(e==null||isNaN(e))return`Đang tính toán...`;if(e>=900)return`[CHIẾU HẾT] Trắng có đòn dứt điểm`;if(e<=-900)return`[CHIẾU HẾT] Đen có đòn dứt điểm`;let t=Number(e);if(Math.abs(t)<.25)return`Cân bằng (${t>=0?`+`:``}${t.toFixed(1)})`;if(t>0)return`Trắng ưu thế ${t>3?`áp đảo`:t>1.5?`lớn`:`nhẹ`} (+${t.toFixed(2)})`;let n=Math.abs(t);return`Đen ưu thế ${n>3?`áp đảo`:n>1.5?`lớn`:`nhẹ`} (${t.toFixed(2)})`}var F=[{id:`fork`,title:`Đòn Chĩa Đôi (Fork)`,tag:`Tấn Công Kép`,desc:`Một quân cờ tấn công cùng lúc hai hoặc nhiều quân đối phương (đặc biệt là Vua + Hậu/Xe).`,detail:`Hiệp sĩ (Mã) và Tốt là hai quân tạo đòn chĩa bất ngờ và nguy hiểm nhất vì đường đi đặc thù không thể bị chặn.`,tips:`Luôn chú ý các ô nhảy của Mã vào ô c7/c2 (chĩa Vua và Xe) hoặc f7/f2.`},{id:`pin`,title:`Đòn Ghim Quân (Pin)`,tag:`Khống Chế`,desc:`Làm tê liệt quân đối phương bằng cách ghim nó vào một quân có giá trị cao hơn phía sau.`,detail:`Ghim tuyệt đối: Quân bị ghim trước Vua không được phép di chuyển (phạm luật). Ghim tương đối: Quân bị ghim trước Hậu hoặc Xe di chuyển sẽ làm mất quân lớn phía sau.`,tips:`Tượng, Xe và Hậu là 3 quân duy nhất có thể thực hiện đòn ghim trên đường thẳng và đường chéo.`},{id:`skewer`,title:`Đòn Xiên (Skewer)`,tag:`Đột Kích Hàng Dọc`,desc:`Tấn công quân lớn hơn ở phía trước buộc nó phải chạy, để lộ quân phòng thủ yếu hơn ở phía sau.`,detail:`Ngược lại với đòn Ghim: Quân đứng trước có giá trị cao hơn (như Vua hoặc Hậu). Khi Vua bị chiếu phải né, quân đứng sau sẽ bị tiêu diệt.`,tips:`Rất hay xuất hiện trong tàn cuộc Xe khi Vua đối thủ đứng cùng hàng ngang/dọc với Xe của họ.`},{id:`discovered_attack`,title:`Đòn Chiếu Mở (Discovered Attack)`,tag:`Đòn Đột Kích`,desc:`Di chuyển một quân để mở đường cho quân tầm xa phía sau chiếu Vua hoặc tấn công mục tiêu hiểm hóc.`,detail:`Quân di chuyển có thể đi đến bất kỳ đâu (thậm chí thí mạng hoặc ăn không quân khác) vì đối thủ bắt buộc phải đối phó với đòn chiếu từ quân phía sau.`,tips:`Nếu quân di chuyển cũng đồng thời chiếu Vua, đó là đòn "Chiếu Kép" (Double Check) - đối thủ chỉ có thể chạy Vua!`},{id:`deflection`,title:`Đòn Đánh Lạc Hướng (Deflection)`,tag:`Phá Vỡ Phòng Thủ`,desc:`Ép buộc hoặc dụ dỗ quân phòng thủ then chốt của đối phương rời bỏ vị trí bảo vệ.`,detail:`Thí quân nhẹ hoặc chiếu bắt buộc để lôi kéo Hậu/Xe/Vua đối phương rời xa ô trọng yếu, mở đường cho đòn kết liễu.`,tips:`Tìm quân đang làm nhiệm vụ "duy nhất bảo vệ một mục tiêu sống còn" và tìm cách đuổi hoặc thí quân tiêu diệt nó.`},{id:`back_rank_mate`,title:`Đòn Chiếu Hết Hàng Đáy (Back-Rank Mate)`,tag:`Chiếu Bí`,desc:`Xe hoặc Hậu thâm nhập vào hàng 8 (hoặc hàng 1) chiếu Vua khi các tốt phía trước chặn mất đường thoát.`,detail:`Khi đối thủ nhập thành mà chưa mở "cửa sổ" (đẩy tốt h6/g6 hoặc h3/g3), Vua sẽ bị nhốt chặt sau bức tường tốt của chính mình.`,tips:`Luôn chủ động mở một lỗ thông hơi (Luft) cho Vua bằng nước h3/h6 khi thế trận có nguy cơ bị tấn công hàng đáy.`},{id:`smothered_mate`,title:`Đòn Chiếu Bí Nghẹt Thở (Smothered Mate)`,tag:`Chiến Thuật`,desc:`Vua đối phương bị bao vây tứ phía bởi chính quân mình ở góc bàn cờ và bị Mã chiếu bí không lối thoát.`,detail:`Đòn phối hợp kinh điển thường bắt đầu bằng việc thí Hậu vào ô g8/g1 ép Xe đối phương phải ăn vào, bịt kín ô thoát cuối cùng của Vua.`,tips:`Đòn này chỉ có thể thực hiện bởi quân Mã (quân cờ duy nhất có thể nhảy qua đầu quân khác).`},{id:`perpetual_defense`,title:`Chiếu Vĩnh Cửu & Hòa Thế Bí (Fortress & Stalemate)`,tag:`Phòng Thủ Cầu Hòa`,desc:`Kỹ năng sinh tồn khi bị lép vế: Chiếu lặp lại không ngừng hoặc tạo thế Vua không có nước đi hợp lệ.`,detail:`Khi đang thua chất hoặc bị dồn ép nghẹt thở, hãy tìm mọi cách thí hết các quân còn lại để Vua rơi vào thế Bức Bí (Stalemate = Hòa cờ ngay lập tức) hoặc dùng Hậu/Xe chiếu liên tục 3 lần lặp lại.`,tips:`Đừng vội đầu hàng! Trong cờ vua, một trận hòa từ thế cờ thua chất là chiến thắng ngoạn mục của tư duy phòng thủ!`}],I=new Map;async function L({fen:e,move:t,provider:n=`gemini`,apiKey:r}){let i=String(r||``).trim();if(!i)throw Error(`Chưa cung cấp API Key. Hãy cấu hình trong menu tiện ích.`);let a=`${n}:${e}:${t}`;if(I.has(a))return I.get(a);if(n===`gemini`){let n=[`gemini-1.5-flash`,`gemini-2.0-flash`,`gemini-1.5-pro`],r=null;for(let o of n)try{let n=`https://generativelanguage.googleapis.com/v1beta/models/${o}:generateContent?key=${i}`,s=await fetch(n,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:`Bạn là kiện tướng cờ vua. Hãy giải thích ngắn gọn bằng 2-3 câu tiếng Việt dễ hiểu vì sao nước cờ ${t} là tối ưu trong thế cờ này (FEN: ${e}). Chỉ rõ lợi ích chiến thuật.`}]}]})});if(!s.ok){let e=(await s.json().catch(()=>null))?.error?.message||`HTTP ${s.status}`;if(r=Error(`Lỗi Google Gemini (${o}): ${e}`),s.status===400||s.status===401||s.status===403)throw r;continue}let c=(await s.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(c)return I.set(a,c),c}catch(e){if(r=e,e.message?.includes(`API key`)||e.message?.includes(`Khóa API`))throw e}throw r||Error(`Không thể kết nối đến mô hình Google Gemini.`)}let o=await fetch(`https://api.openai.com/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({model:`gpt-4o-mini`,messages:[{role:`user`,content:`Bạn là kiện tướng cờ vua. Hãy giải thích ngắn gọn bằng 2-3 câu tiếng Việt dễ hiểu vì sao nước cờ ${t} là tối ưu trong thế cờ này (FEN: ${e}). Chỉ rõ lợi ích chiến thuật.`}],max_tokens:150})});if(!o.ok){let e=(await o.json().catch(()=>null))?.error?.message||`HTTP ${o.status}`;throw Error(`Lỗi OpenAI: ${e}`)}let s=(await o.json()).choices?.[0]?.message?.content;if(!s)throw Error(`Không nhận được nội dung phân tích từ OpenAI.`);return I.set(a,s),s}var R=class{constructor({onReanalyze:e,onModeChange:t}){this.onReanalyze=e,this.onModeChange=t,this.root=null,this.bubble=null,this.isMinimized=!1,this.currentTab=`chat`,this.moveHistory=[],this.currentFen=null,this.lastBestMove=null,this.lastEvaluation=0,this.activeMode=`mate_hunt`,this.config={},this.isAnalyzing=!1,this.init()}init(){document.querySelectorAll(`#chessmate-hud-root, #chessmate-bubble-root`).forEach(e=>e.remove()),this.createStyles(),this.createBubble(),this.createWindow(),this.attachDragEvents()}createStyles(){if(document.getElementById(`chessmate-hud-styles`))return;let e=document.createElement(`style`);e.id=`chessmate-hud-styles`,e.textContent=`
      #chessmate-hud-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        height: 500px;
        background: rgba(12, 14, 18, 0.98);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
        color: #d1d5db;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        z-index: 2147483640;
        overflow: hidden;
        transition: opacity 0.15s ease, transform 0.15s ease;
        user-select: none;
        box-sizing: border-box;
      }

      #chessmate-hud-root * {
        box-sizing: border-box;
      }

      #chessmate-hud-root.minimized {
        opacity: 0;
        pointer-events: none;
        transform: translateY(12px);
      }

      #chessmate-hud-root.hidden {
        display: none;
      }

      /* Bubble button when minimized (Icon-free) */
      #chessmate-bubble-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #14171d;
        color: #e59b2c;
        border: 1px solid #e59b2c;
        padding: 8px 14px;
        border-radius: 2px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        z-index: 2147483640;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        transition: background 0.15s ease, color 0.15s ease;
        user-select: none;
      }

      #chessmate-bubble-root:hover {
        background: #e59b2c;
        color: #0c0e12;
      }

      #chessmate-bubble-root.hidden {
        display: none;
      }

      /* Header */
      .cm-hud-header {
        padding: 10px 14px;
        background: #08090c;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: move;
      }

      .cm-hud-title {
        font-size: 11px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }

      .cm-hud-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cm-btn-ctl {
        background: #1e222a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #808893;
        width: 28px;
        height: 24px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 10px;
        font-weight: 700;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        transition: background 0.15s, color 0.15s;
      }

      .cm-btn-ctl:hover {
        background: #2a303c;
        color: #ffffff;
      }

      .cm-btn-ctl.close:hover {
        background: #ef4444;
        border-color: #ef4444;
        color: #ffffff;
      }

      /* Tabs */
      .cm-hud-tabs {
        display: flex;
        background: #090a0d;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 3px;
        gap: 3px;
      }

      .cm-tab-btn {
        flex: 1;
        background: transparent;
        border: none;
        color: #808893;
        padding: 7px 0;
        border-radius: 2px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: center;
      }

      .cm-tab-btn:hover {
        color: #ffffff;
      }

      .cm-tab-btn.active {
        background: #1e222a;
        color: #e59b2c;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      /* Body */
      .cm-hud-body {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .cm-hud-body::-webkit-scrollbar {
        width: 4px;
      }
      .cm-hud-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 2px;
      }

      /* Best Move Card */
      .cm-card {
        background: #14171d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cm-card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 6px;
      }

      .cm-tag {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 2px 6px;
        border-radius: 2px;
        background: rgba(229, 155, 44, 0.12);
        color: #e59b2c;
        border: 1px solid rgba(229, 155, 44, 0.3);
        text-transform: uppercase;
      }

      .cm-eval {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 700;
        color: #2dd4bf;
      }

      .cm-instruction {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.4;
      }

      .cm-reason {
        font-size: 11px;
        color: #808893;
        line-height: 1.45;
      }

      .cm-reason strong {
        color: #d1d5db;
      }

      /* Explain Button & Result */
      .cm-explain-box {
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      .cm-btn-explain {
        width: 100%;
        background: #1e222a;
        color: #d1d5db;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 7px 10px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        text-align: center;
      }

      .cm-btn-explain:hover {
        background: #2a303c;
        color: #ffffff;
      }

      .cm-explain-result {
        margin-top: 8px;
        padding: 8px;
        background: #090a0d;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 2px;
        font-size: 11px;
        line-height: 1.45;
        color: #d1d5db;
      }

      /* History List */
      .cm-history-title {
        font-size: 10px;
        font-weight: 700;
        color: #808893;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-top: 4px;
      }

      .cm-history-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cm-history-item {
        background: #14171d;
        border-left: 2px solid #e59b2c;
        padding: 6px 8px;
        border-radius: 0 2px 2px 0;
        font-size: 11px;
      }

      .cm-history-item .cm-meta {
        color: #808893;
        font-size: 10px;
        margin-top: 2px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      /* Modes Tab */
      .cm-modes-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .cm-mode-tile {
        background: #14171d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .cm-mode-tile:hover {
        background: #1a1e26;
        border-color: rgba(255, 255, 255, 0.15);
      }

      .cm-mode-tile.selected {
        background: rgba(229, 155, 44, 0.08);
        border-color: #e59b2c;
      }

      .cm-mode-tile-title {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-transform: uppercase;
        margin-bottom: 3px;
      }

      .cm-mode-tile-desc {
        font-size: 11px;
        color: #808893;
        line-height: 1.4;
      }

      /* Book & Tactics Tab */
      .cm-book-tile {
        background: #14171d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        padding: 10px;
        margin-bottom: 6px;
      }

      .cm-book-tile-title {
        font-size: 11px;
        font-weight: 700;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .cm-book-tile-desc {
        font-size: 11px;
        color: #808893;
        line-height: 1.4;
      }

      .cm-book-tile-tips {
        margin-top: 4px;
        color: #d1d5db;
        font-size: 10px;
      }

      /* Footer */
      .cm-hud-footer {
        padding: 8px 12px;
        background: #08090c;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .cm-btn-reanalyze {
        background: #e59b2c;
        color: #0c0e12;
        border: none;
        padding: 6px 12px;
        border-radius: 2px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.4px;
        cursor: pointer;
        text-transform: uppercase;
        transition: background 0.15s ease;
      }

      .cm-btn-reanalyze:hover {
        background: #c98421;
      }

      .cm-footer-status {
        font-size: 10px;
        color: #808893;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
    `,document.head.append(e)}createBubble(){this.bubble=document.createElement(`div`),this.bubble.id=`chessmate-bubble-root`,this.bubble.className=`hidden`,this.bubble.innerHTML=`
      <span id="cm-bubble-text">[CHESSMATE - TRỢ THỦ]</span>
    `,this.bubble.onclick=()=>this.restore(),document.body.append(this.bubble)}createWindow(){this.root=document.createElement(`div`),this.root.id=`chessmate-hud-root`,this.root.innerHTML=`
      <div class="cm-hud-header" id="cm-drag-handle">
        <div class="cm-hud-title">CHESSMATE - CỬA SỔ PHÂN TÍCH</div>
        <div class="cm-hud-controls">
          <button class="cm-btn-ctl" id="cm-btn-min" title="Thu nhỏ">[-]</button>
          <button class="cm-btn-ctl close" id="cm-btn-close" title="Tắt hẳn">[X]</button>
        </div>
      </div>

      <div class="cm-hud-tabs">
        <button class="cm-tab-btn active" data-tab="chat">NƯỚC ĐI</button>
        <button class="cm-tab-btn" data-tab="modes">TƯ DUY</button>
        <button class="cm-tab-btn" data-tab="book">KHAI CUỘC</button>
      </div>

      <div class="cm-hud-body" id="cm-hud-body">
        <!-- Rendered based on active tab -->
      </div>

      <div class="cm-hud-footer">
        <span class="cm-footer-status" id="cm-status-text">[SẴN SÀNG]</span>
        <button class="cm-btn-reanalyze" id="cm-btn-reanalyze">
          QUÉT LẠI BÀN CỜ
        </button>
      </div>
    `,document.body.append(this.root),this.root.querySelector(`#cm-btn-min`).onclick=e=>{e.stopPropagation(),this.minimize()},this.root.querySelector(`#cm-btn-close`).onclick=e=>{e.stopPropagation(),this.close()},this.root.querySelectorAll(`.cm-tab-btn`).forEach(e=>{e.onclick=()=>{this.root.querySelectorAll(`.cm-tab-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),this.currentTab=e.getAttribute(`data-tab`),this.renderBody()}}),this.root.querySelector(`#cm-btn-reanalyze`).onclick=()=>{this.status(`[ĐANG QUÉT BÀN CỜ...]`,!0),this.onReanalyze?.()},this.renderBody()}minimize(){this.isMinimized=!0,this.root.classList.add(`minimized`),setTimeout(()=>{this.root.classList.add(`hidden`),this.bubble.classList.remove(`hidden`)},150)}restore(){this.isMinimized=!1,this.bubble.classList.add(`hidden`),this.root.classList.remove(`hidden`),setTimeout(()=>{this.root.classList.remove(`minimized`)},20)}close(){this.root.classList.add(`hidden`),this.bubble.classList.add(`hidden`),r({showHud:!1}).catch(()=>{})}show(){this.root.classList.remove(`hidden`),this.isMinimized?this.bubble.classList.remove(`hidden`):this.root.classList.remove(`minimized`)}status(e,t=!1){this.isAnalyzing=t;let n=this.root.querySelector(`#cm-status-text`);n&&(n.textContent=e);let r=this.bubble?.querySelector(`#cm-bubble-text`);r&&(r.textContent=e)}updateConfig(e){this.config={...this.config,...e},e.thinkingMode&&e.thinkingMode!==this.activeMode&&(this.activeMode=e.thinkingMode,this.renderBody()),e.showHud===!1?this.close():e.showHud===!0&&this.root.classList.contains(`hidden`)&&this.bubble.classList.contains(`hidden`)&&this.show()}updateAnalysis({fen:e,uci:t,evaluation:n,depth:r,playedMoves:i=[]}){this.currentFen=e,this.lastBestMove=t,this.lastEvaluation=n;let a=N(t,e),o=P(n);this.moveHistory.unshift({time:new Date().toLocaleTimeString(),short:a.short||t,title:a.title,eval:o}),this.moveHistory.length>20&&this.moveHistory.pop(),this.renderBody(),this.status(`[XONG] ${t.toUpperCase()} (D${r})`,!1);let s=this.bubble?.querySelector(`#cm-bubble-text`);s&&(s.textContent=`[${t.toUpperCase()}] ${a.short||``}`)}renderBody(){let e=this.root.querySelector(`#cm-hud-body`);e&&(this.currentTab===`chat`?this.renderChatTab(e):this.currentTab===`modes`?this.renderModesTab(e):this.currentTab===`book`&&this.renderBookTab(e))}renderChatTab(e){let t=this.lastBestMove?N(this.lastBestMove,this.currentFen):null,n=P(this.lastEvaluation),r=a(this.activeMode),i=``;if(t&&this.lastBestMove?i+=`
        <div class="cm-card">
          <div class="cm-card-head">
            <span class="cm-tag">${r.badge}</span>
            <span class="cm-eval">${n}</span>
          </div>
          <div class="cm-instruction">
            ${t.title}
          </div>
          <div class="cm-reason">
            <strong>Chiến thuật:</strong> ${t.desc}
          </div>

          <div class="cm-explain-box">
            <button class="cm-btn-explain" id="cm-btn-ai-explain">
              PHÂN TÍCH CHIẾN THUẬT SÂU
            </button>
            <div id="cm-ai-result-box" style="display:none;" class="cm-explain-result"></div>
          </div>
        </div>
      `:i+=`
        <div class="cm-card" style="text-align: center; padding: 28px 12px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">ĐANG CHỜ LƯỢT ĐI</div>
          <div style="font-size: 11px; color: #808893; line-height: 1.45;">
            Hệ thống tự động phân tích và đưa ra tên quân cờ kèm ô di chuyển ngay khi đối thủ đi xong.
          </div>
        </div>
      `,this.moveHistory.length>0){i+=`
        <div class="cm-history-title">LỊCH SỬ GỢI Ý GẦN ĐÂY</div>
        <div class="cm-history-list">
      `;for(let e of this.moveHistory.slice(0,5))i+=`
          <div class="cm-history-item">
            <strong>${e.title}</strong>
            <div class="cm-meta">${e.eval} - ${e.time}</div>
          </div>
        `;i+=`</div>`}e.innerHTML=i;let o=e.querySelector(`#cm-btn-ai-explain`);o&&(o.onclick=async()=>{let t=e.querySelector(`#cm-ai-result-box`);if(t){t.style.display=`block`,t.textContent=`[HỆ THỐNG] Đang phân tích cấu trúc ván cờ...`;try{if(!this.config.llmApiKey){t.innerHTML=`
              <strong>Phân tích cơ bản:</strong> Nước cờ <strong>${this.lastBestMove.toUpperCase()}</strong> giúp củng cố trung tâm, kiểm soát đường cơ động và loại bỏ điểm yếu chiến lược.
              <br><br>
              <span style="color:#808893;">(Ghi chú: Nhập API Key trong menu tiện ích để mở khóa giải thích văn bản chi tiết).</span>
            `;return}t.textContent=await L({fen:this.currentFen,move:this.lastBestMove,provider:this.config.llmProvider||`openai`,apiKey:this.config.llmApiKey})}catch(e){t.textContent=`[LỖI] ${e.message||String(e)}`}}})}renderModesTab(e){let t=`
      <div style="font-size: 11px; color: #808893; margin-bottom: 4px;">
        Chọn mục tiêu tính toán của động cơ Stockfish:
      </div>
      <div class="cm-modes-grid">
    `;for(let[e,n]of Object.entries(o)){let r=e===this.activeMode;t+=`
        <div class="cm-mode-tile ${r?`selected`:``}" data-mode="${e}">
          <div class="cm-mode-tile-title">
            <span>${n.name}</span>
            ${r?`<span style="color:#e59b2c; font-size:10px;">[ĐANG DÙNG]</span>`:``}
          </div>
          <div class="cm-mode-tile-desc">${n.description}</div>
        </div>
      `}t+=`</div>`,e.innerHTML=t,e.querySelectorAll(`.cm-mode-tile`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-mode`);this.activeMode=t,r({thinkingMode:t}).catch(()=>{}),this.onModeChange?.(t),this.renderBody(),this.status(`[CHẾ ĐỘ] ${a(t).badge}`)}})}renderBookTab(e){let t=`
      <div style="font-size: 11px; color: #808893; margin-bottom: 6px;">
        Cẩm nang các bài học chiến thuật chuẩn mực:
      </div>
    `;for(let e of F)t+=`
        <div class="cm-book-tile">
          <div class="cm-book-tile-title">
            <span>${e.title}</span>
            <span class="cm-tag">${e.tag}</span>
          </div>
          <div class="cm-book-tile-desc">
            ${e.desc}
            <div class="cm-book-tile-tips">
              Ghi chú: ${e.tips}
            </div>
          </div>
        </div>
      `;e.innerHTML=t}attachDragEvents(){let e=this.root.querySelector(`#cm-drag-handle`);if(!e)return;let t=!1,n=0,r=0,i=0,a=0;e.onmousedown=e=>{if(e.target.closest(`button`))return;t=!0,n=e.clientX,r=e.clientY;let o=this.root.getBoundingClientRect();i=o.left,a=o.top,this.root.style.bottom=`auto`,this.root.style.right=`auto`,this.root.style.left=`${i}px`,this.root.style.top=`${a}px`;let s=e=>{if(!t)return;let o=e.clientX-n,s=e.clientY-r,c=window.innerWidth-this.root.offsetWidth-10,l=window.innerHeight-this.root.offsetHeight-10,u=Math.max(10,Math.min(c,i+o)),d=Math.max(10,Math.min(l,a+s));this.root.style.left=`${u}px`,this.root.style.top=`${d}px`},c=()=>{t=!1,document.removeEventListener(`mousemove`,s),document.removeEventListener(`mouseup`,c)};document.addEventListener(`mousemove`,s),document.addEventListener(`mouseup`,c)}}},z=(e,t)=>new Promise(n=>setTimeout(n,e+Math.random()*Math.max(0,t-e)));function B(e,t,n=10){let r={x:e.x+(t.x-e.x)*.3,y:e.y+(Math.random()-.5)*80},i={x:e.x+(t.x-e.x)*.7,y:t.y+(Math.random()-.5)*80};return Array.from({length:n},(a,o)=>{let s=(o+1)/n,c=1-s;return{x:c**3*e.x+3*c**2*s*r.x+3*c*s**2*i.x+s**3*t.x,y:c**3*e.y+3*c**2*s*r.y+3*c*s**2*i.y+s**3*t.y}})}function V(e,t,n,r){r.dispatchEvent(new MouseEvent(e,{bubbles:!0,clientX:t,clientY:n,buttons:e===`mouseup`?0:1}))}function H(t,n){let r=n[1],i=n[0];for(let n of e(r,i)){let e=t.querySelector(n);if(e)return e}return null}async function U(e,t,{delayMin:n=800,delayMax:r=2500}={}){let i=p(t);if(!i)throw Error(`Invalid UCI move: `+t);let a=e.getBoundingClientRect(),o=e.classList.contains(`flipped`),s=m(i.from,a,o),c=m(i.to,a,o),l=H(e,i.from)||e;await z(n,r),V(`mousedown`,s.x,s.y,l);let u=8+Math.floor(Math.random()*8);for(let e of B(s,c,u))V(`mousemove`,e.x+(Math.random()*4-2),e.y+(Math.random()*4-2),document),await z(8,25);return V(`mouseup`,c.x,c.y,e),await z(80,160),V(`click`,s.x,s.y,l),await z(80,160),V(`click`,c.x,c.y,e),!0}var W=new O,G=new c,K,q,J,Y,X=!1;async function Z(e=0){return y()||(e>=12?null:(await new Promise(t=>setTimeout(t,Math.min(3e3,150*1.5**e))),Z(e+1)))}async function Q(e=null){if(!K?.enabled){q?.clear(),J?.status(`ChessMate: Đang tắt`);return}if(document.visibilityState===`hidden`||X)return;let t=e||W.getCurrentFEN();if(!t){let e=W.getLastDiagnostic()||`Đang quét bàn cờ...`;s.warn(`Could not extract valid FEN:`,e),J?.status(e,!0),setTimeout(()=>{if(K?.enabled&&!X){let e=W.getCurrentFEN();if(e)Q(e);else{let e=W.getLastDiagnostic()||`Bấm quét lại bàn cờ`;J?.status(`Quét: ${e}`)}}},600);return}X=!0,J?.status(`Đang suy nghĩ nước cờ...`,!0);try{s.info(`Analyzing FEN:`,t,`Mode:`,K.thinkingMode);let e=await G.getBestMove(t,K);if(!K.enabled){q?.clear();return}J?.updateAnalysis({fen:t,uci:e.move,evaluation:e.evaluation,depth:K.depth}),K.showArrows!==!1&&K.showOverlay!==!1?q?.showArrow(e.move,e.evaluation,K.depth):q?.clear(),K.autoPlay&&await U(Y,e.move,K)}catch(e){s.warn(`Analysis error:`,e),J?.status(`Engine: `+(e.message||`Lỗi`))}finally{X=!1}}async function $(){console.log(`%c[ChessMate Agent]`,`color: #22c55e; font-weight: bold;`,`Content script booting on`,window.location.href),K=await i(),J=new R({onReanalyze:()=>Q(),onModeChange:e=>{K.thinkingMode=e,Q()}}),J.updateConfig(K);let e=e=>{e&&Y!==e&&(Y=e,s.info(`Chess board successfully located:`,Y),q=new k(Y),W.on(`move-detected`,async({fen:e})=>{await Q(e)}),W.start(Y),K.enabled?setTimeout(()=>Q(),200):J.status(`ChessMate: Đang tắt`))},t=await Z();if(t)e(t);else{s.warn(`Board not found immediately, observing DOM for board appearance...`);let t=new MutationObserver(()=>{let n=y();n&&(t.disconnect(),e(n))});t.observe(document.body,{childList:!0,subtree:!0})}n(e=>{let t=!K?.enabled;K={...K,...e},J?.updateConfig(K),K.enabled?t&&K.enabled&&Q():q?.clear()}),chrome.runtime?.onMessage?.addListener(e=>{e?.type===`reanalyze`&&Q(),e?.type===`show_hud`&&J?.show()})}$().catch(s.error);