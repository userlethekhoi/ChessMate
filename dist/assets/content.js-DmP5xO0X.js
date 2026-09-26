import{a as e,c as t,i as n,n as r,o as i,r as a,s as o}from"./llm-client-CDOB8dke.js";import{a as s,c,l,n as u,o as d,r as f,s as p}from"./board-evaluator-BmEPwPFI.js";import{n as m,t as h}from"./engine-manager-BGgj0ZFd.js";var g=`abcdefgh`;function _(e){return e.map(e=>{let t=``,n=0;for(let r of e)r?(n&&=(t+=n,0),t+=r):n++;return t+(n||``)}).join(`/`)}function v(e){let t=e.split(`/`);return t.length===8&&t.every(e=>{let t=0;for(let n of e)if(/^[1-8]$/.test(n))t+=Number(n);else if(/^[prnbqkPRNBQK]$/.test(n))t++;else return!1;return t===8})}function y(e){let t=0,n=0;for(let r of e)r===`K`?t++:r===`k`&&n++;return t===1&&n===1}function b(e){let t=String(e||``).trim().split(/\s+/);return!(t.length<2||!v(t[0])||!/^[wb]$/.test(t[1])||!y(t[0])||t.length>=3&&!/^(-|[KQkq]{1,4})$/.test(t[2])||t.length>=4&&!/^(-|[a-h][36])$/.test(t[3]))}function x(e){let t=/^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(e||``);return t?{from:t[1],to:t[2],promotion:t[3]}:null}function S(e,t,n=!1){let r=g.indexOf(e[0]),i=Number(e[1])-1,a=n?7-r:r,o=n?i:7-i;return{x:t.left+(a+.5)*t.width/8,y:t.top+(o+.5)*t.height/8}}var C=``,w=null;function ee(){w=null,C=``}var te={king:`k`,queen:`q`,rook:`r`,bishop:`b`,knight:`n`,horse:`n`,pawn:`p`};function ne(e,t=null){e=String(e||``).toLowerCase();let n=e.match(/\b([wb])([kqrbnp])\b/);if(n){let[,e,t]=n;return e===`w`?t.toUpperCase():t.toLowerCase()}if(t){let e=`${t.style?.backgroundImage||(typeof window<`u`?window.getComputedStyle(t).backgroundImage:``)||``} ${t.src||t.getAttribute?.(`src`)||``}`.toLowerCase().match(/\/([wb])([kqrbnp])\.(?:png|svg|webp)/i);if(e){let[,t,n]=e;return t===`w`?n.toUpperCase():n.toLowerCase()}}let r=/white|\bwp\b|\bwr\b|\bwn\b|\bwb\b|\bwq\b|\bwk\b/.test(e),i=/black|\bbp\b|\bbr\b|\bbn\b|\bbb\b|\bbq\b|\bbk\b/.test(e);if(!r&&!i)return null;for(let[t,n]of Object.entries(te))if(e.includes(t))return r?n.toUpperCase():n.toLowerCase();return null}function T(e){return e?ne(`${String(e.className||e.getAttribute?.(`class`)||``)} ${e.getAttribute?.(`data-piece`)||``} ${e.getAttribute?.(`aria-label`)||``}`,e):null}function E(e){if(!e||typeof e.getBoundingClientRect!=`function`)return!1;let t=e.getBoundingClientRect();if(t.width<140||t.height<140)return!1;let n=t.width/t.height;if(n<.85||n>1.18)return!1;let r=[e];e.shadowRoot&&r.push(e.shadowRoot);let i=0;for(let e of r){let t=e.querySelectorAll?.(`.piece, [class*="piece"], [data-piece]`);t&&(i+=t.length)}return i>=2}function D(e=document){let t=e.querySelector(`wc-chess-board, chess-board, #board-single`);if(t&&E(t))return t;for(let t of o){let n=e.querySelector(t);if(n&&E(n))return n}let n=e.querySelectorAll?.(`.piece, [class*="piece"], [data-piece]`)||[];if(n.length>=2)for(let e of n){let t=e.closest?.(`wc-chess-board, chess-board, #board-single, .board, [id*="board"], [class*="board"]`)||e.parentElement;if(t&&E(t)){let e=t.querySelector?.(`wc-chess-board, chess-board, #board-single, .board`);return e&&e!==t&&E(e)?e:t}}let r=Array.from(e.querySelectorAll?.(`wc-chess-board, chess-board, #board-single, .board, [id*="board"], [class*="board"], [class*="chessboard"]`)||[]).filter(e=>E(e));if(r.length>0)return r.sort((e,t)=>{let n=e.getBoundingClientRect(),r=t.getBoundingClientRect();return n.width*n.height-r.width*r.height}),r[0];if(t){let e=t.getBoundingClientRect();if(e.width>140&&e.height>140){let n=e.width/e.height;if(n>=.85&&n<=1.18)return t}}return null}function O(e,n,r){for(let i of t(n,r)){let t=e.querySelector(i)||e.shadowRoot?.querySelector(i);if(t)return t}return null}function k(e){let t=String(e.getAttribute?.(`class`)||e.className||``).toLowerCase();return!(t.includes(`captured`)||t.includes(`ghost`)||t.includes(`dragging-source`)||e.style?.display===`none`||e.style?.visibility===`hidden`||e.style?.opacity===`0`||e.getAttribute(`style`)?.includes(`opacity: 0`))}function A(e,t,n){let r=[String(e.getAttribute?.(`class`)||e.className||``),String(e.parentElement?.getAttribute?.(`class`)||e.parentElement?.className||``),String(e.getAttribute?.(`data-square`)||``),String(e.parentElement?.getAttribute?.(`data-square`)||``)].join(` `),i=r.match(/square-0?([1-8])0?([1-8])/);if(i){let e=parseInt(i[1],10),t=parseInt(i[2],10);return{fileIdx:e-1,rankIdx:8-t}}let a=r.match(/square-([a-h])([1-8])/i);if(a)return{fileIdx:`abcdefgh`.indexOf(a[1].toLowerCase()),rankIdx:8-parseInt(a[2],10)};if(t?.width&&t?.height){let r=e.getBoundingClientRect();if(r.width>5&&r.height>5){let e=r.left+r.width/2,i=r.top+r.height/2;if(e>=t.left-10&&e<=t.right+10&&i>=t.top-10&&i<=t.bottom+10){let r=Math.max(0,Math.min(7,Math.floor((e-t.left)/t.width*8))),a=Math.max(0,Math.min(7,Math.floor((i-t.top)/t.height*8)));return n&&(r=7-r,a=7-a),{fileIdx:r,rankIdx:a}}}}return null}function re(e,t){if(!e||!t||t.length<2)return null;let n=t[0].toLowerCase(),r=`abcdefgh`.indexOf(n)+1,i=parseInt(t[1],10);if(r<1||r>8||i<1||i>8)return null;let a=[`.piece.square-${r}${i}`,`.piece.square-0${r}0${i}`,`.piece.square-${n}${i}`,`[class*="piece"][class*="square-${r}${i}"]`,`[class*="piece"][class*="square-${n}${i}"]`,`[class*="square-${r}${i}"]`,`[class*="square-${n}${i}"]`,`[data-square="${n}${i}"]`,`[data-square="${r}${i}"]`],o=[e];e.shadowRoot&&o.push(e.shadowRoot);for(let e of o)for(let t of a){let n=e.querySelector?.(t);if(n&&k(n))return n}let s=e.querySelectorAll?.(`.piece, [class*="piece"], [data-piece]`)||[],c=N(e),l=e.getBoundingClientRect();for(let e of s){if(!k(e))continue;let t=A(e,l,c);if(t){let r=`abcdefgh`[t.fileIdx],a=8-t.rankIdx;if(r===n&&a===i)return e}}return null}function j(e,t,n=null,r=null){if(!e||!t||t.length<2)return null;let i=t[0].toLowerCase(),a=`abcdefgh`.indexOf(i)+1,o=parseInt(t[1],10),s=N(e),c=re(e,t);if(c){let e=c.getBoundingClientRect();if(e.width>5&&e.height>5)return{x:e.left+e.width/2,y:e.top+e.height/2,width:e.width,height:e.height}}let l=O(e,o,i);if(l){let e=l.getBoundingClientRect();if(e.width>5&&e.height>5)return{x:e.left+e.width/2,y:e.top+e.height/2,width:e.width,height:e.height}}let u=e.querySelectorAll?.(`.piece, [class*="piece"], [data-piece]`)||[],d=e.getBoundingClientRect(),f=null,p=null,m=n?.width||null,h=n?.height||null;for(let e of u){if(!k(e))continue;let t=A(e,d,s);if(!t)continue;let n=e.getBoundingClientRect();if(n.width<5||n.height<5)continue;m||=n.width,h||=n.height;let r=`abcdefgh`[t.fileIdx],a=8-t.rankIdx;if(r===i&&f===null&&(f=n.left+n.width/2),a===o&&p===null&&(p=n.top+n.height/2),f!==null&&p!==null)break}if((f===null||p===null)&&n&&r){let e=`abcdefgh`.indexOf(r[0].toLowerCase())+1,t=parseInt(r[1],10),i=m||n.width||d.width/8,c=h||n.height||d.height/8,l=(a-e)*(s?-1:1),u=(o-t)*(s?1:-1);f===null&&(f=n.x+l*i),p===null&&(p=n.y+u*c)}let g=m||d.width/8,_=h||d.height/8,v=s?8-a:a-1,y=s?o-1:8-o;return{x:f===null?d.left+(v+.5)*g:f,y:p===null?d.top+(y+.5)*_:p,width:g,height:_}}function ie(e){if(!e)return[];let t=new Set,n=[e];e.shadowRoot&&n.push(e.shadowRoot);for(let e of n)try{e.querySelectorAll&&e.querySelectorAll(`.piece, [class*="piece"], [data-piece]`).forEach(e=>t.add(e))}catch{}if(t.size>=2)return Array.from(t);let r=[e],i=new Set;for(;r.length>0;){let e=r.shift();if(e&&!i.has(e)&&(i.add(e),e instanceof Element&&(t.add(e),e.shadowRoot&&!i.has(e.shadowRoot)&&r.push(e.shadowRoot)),e.children))for(let t=0;t<e.children.length;t++)r.push(e.children[t])}return Array.from(t)}function M(e){let t=e.getBoundingClientRect(),n=N(e),r=ie(e),i=Array.from({length:8},()=>Array(8).fill(null)),a=0;for(let e of r){if(!k(e))continue;let r=T(e);if(!r)continue;let o=A(e,t,n);if(!o)continue;let{fileIdx:s,rankIdx:c}=o;s>=0&&s<8&&c>=0&&c<8&&(i[c][s]=r,a++)}return C=`Scanned ${r.length} els, found ${a} pieces`,m.info(`[ChessMate] ${C}`),a>=2?_(i):null}function N(e){if(!e)return!1;if(e.classList.contains(`flipped`)||e.classList.contains(`board-flipped`)||e.classList.contains(`reversed`))return!0;let t=e.getAttribute(`data-orientation`)||e.getAttribute(`orientation`)||e.getAttribute(`board-orientation`)||e.getAttribute(`flipped`);if(t===`black`||t===`1`||t===`true`)return!0;if(t===`white`||t===`0`||t===`false`)return!1;if(e.parentElement?.classList?.contains(`flipped`)||e.closest?.(`[class*="flipped"]`))return!0;let n=e.querySelectorAll?.(`.coordinate-light, .coordinate-dark, [class*="coordinate"], text.coordinate`)||[];for(let t of n){let n=(t.textContent||``).trim();if(n===`1`||n===`8`){let r=t.getBoundingClientRect(),i=e.getBoundingClientRect();if(i.height>0){let e=(r.top+r.height/2-i.top)/i.height;if(n===`1`&&e<.35||n===`8`&&e>.65)return!0;if(n===`1`&&e>.65||n===`8`&&e<.35)return!1}}}return!1}function P(e=D()){return N(e)?`b`:`w`}function F(e){let t=e.querySelectorAll(`.highlight, [class*="highlight"]`);if(t.length<2)return null;let n=e.querySelectorAll(`.piece, [class*="piece"], [data-piece]`);for(let r of t){let t=String(r.getAttribute(`class`)||r.className||``).match(/square-0?([1-8])0?([1-8])/);if(!t)continue;let i=parseInt(t[1],10),a=parseInt(t[2],10),o=`square-${t[1]}${t[2]}`;for(let e of n)if(k(e)&&String(e.getAttribute(`class`)||e.className||``).includes(o)){let t=T(e);if(t){let e=t===t.toUpperCase(),n=e?`b`:`w`;return m.info(`Turn detected from moved piece ${t} on ${o} (${e?`White`:`Black`} moved) → turn=${n}`),n}}let s=O(e,a,i);if(s){let e=T(s);if(e){let t=e===e.toUpperCase()?`b`:`w`;return m.info(`Turn detected from square element on ${i},${a}: piece=${e} → turn=${t}`),t}}}return null}function ae(){for(let e of[`wc-move-list .node`,`wc-vertical-move-list .node`,`.node[data-node-index]`,`.vertical-move-list .node`,`.moves-list .node`,`.move-list .node`,`.move-list-v3 .node`])try{let t=document.querySelectorAll(e);if(t.length>0){let n=Array.from(t).filter(e=>{let t=(e.textContent||``).trim();return!/^\d+\.?$/.test(t)});if(n.length>0){let t=n[n.length-1];if(t.classList.contains(`white-node`)||t.classList.contains(`white`))return`b`;if(t.classList.contains(`black-node`)||t.classList.contains(`black`))return`w`;let r=n.length%2==1?`b`:`w`;return m.info(`Turn via ply count: sel="${e}" count=${n.length} → turn=${r}`),r}}}catch{}return null}function oe(e){let t=F(e);if(t)return t;let n=ae();if(n)return n;let r=N(e),i=document.querySelector(`.clock-bottom.clock-player-turn, .clock-player-turn.clock-bottom, [class*="clock"][class*="bottom"][class*="turn"], [class*="clock"][class*="bottom"][class*="running"]`),a=document.querySelector(`.clock-top.clock-player-turn, .clock-player-turn.clock-top, [class*="clock"][class*="top"][class*="turn"], [class*="clock"][class*="top"][class*="running"]`);return i?r?`b`:`w`:a?r?`w`:`b`:`w`}function se(e){let t=e.split(`/`);if(t.length!==8)return`-`;function n(e){let t=[];for(let n of e)if(/^[1-8]$/.test(n))for(let e=0;e<parseInt(n,10);e++)t.push(null);else t.push(n);for(;t.length<8;)t.push(null);return t}let r=n(t[7]||``),i=n(t[0]||``),a=``;return r[4]===`K`&&(r[7]===`R`&&(a+=`K`),r[0]===`R`&&(a+=`Q`)),i[4]===`k`&&(i[7]===`r`&&(a+=`k`),i[0]===`r`&&(a+=`q`)),a||`-`}function ce(e,t,n){if(!e||!t||e===t)return`-`;function r(e){let t=[];for(let n of e.split(`/`)){let e=[];for(let t of n)if(/^[1-8]$/.test(t))for(let n=0;n<parseInt(t,10);n++)e.push(null);else e.push(t);t.push(e)}return t}try{let i=r(e),a=r(t),o=`abcdefgh`;if(n===`b`){for(let e=0;e<8;e++)if(i[6][e]===`P`&&a[4][e]===`P`&&a[6][e]===null)return`${o[e]}3`}else for(let e=0;e<8;e++)if(i[1][e]===`p`&&a[3][e]===`p`&&a[1][e]===null)return`${o[e]}6`}catch{}return`-`}function le(e=D()){if(!e)return C=`Board element not found`,null;let t=M(e);if(!t){let n=[],r=!1;for(let t=8;t>=1;t--){let i=[];for(let n of`abcdefgh`){let a=T(O(e,t,n));a&&(r=!0),i.push(a)}n.push(i)}r&&(t=_(n))}if(!t)return m.info(`Could not extract board placement:`,C),null;let n=oe(e),r=se(t),i=ce(w,t,n);w=t;let a=`${t} ${n} ${r} ${i} 0 1`;return m.info(`FEN built: turn=${n} castling=${r} ep=${i}`),b(a)?(C=`OK`,m.info(`[ChessMate] Successfully extracted FEN:`,a),a):(C=`Invalid FEN: ${a.slice(0,30)}...`,m.info(`Board state could not be validated:`,a),null)}var ue=class{constructor(){this.listeners=new Map,this.lastFEN=null,this.timer=null,this.observer=null,this.board=null}on(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>this.listeners.get(e)?.delete(t)}emit(e,t){this.listeners.get(e)?.forEach(e=>{try{e(t)}catch(e){m.error(e)}})}getLastDiagnostic(){return C}getCurrentFEN(){return le(this.board||D())}start(e=null){if(this.board=e||D(),!this.board){let e=0,t=()=>{this.board=D(),this.board?this.initObserver():e++<8&&setTimeout(t,150*2**e)};setTimeout(t,150);return}this.initObserver()}initObserver(){this.board&&(this.stop(),this.observer=new MutationObserver(e=>{this.board&&e.some(e=>this.board.contains(e.target))&&(clearTimeout(this.timer),this.timer=setTimeout(()=>this.check(),250))}),this.observer.observe(this.board,{childList:!0,subtree:!0,attributes:!0,attributeFilter:[`class`,`style`]}),setTimeout(()=>this.check(!0),200))}check(e=!1){if(document.visibilityState===`hidden`)return;let t=this.getCurrentFEN();if(!t||!e&&t===this.lastFEN)return;let n=this.lastFEN;this.lastFEN=t;let r=`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR`;t.startsWith(r)&&n&&!n.startsWith(r)&&this.emit(`new-game`,{fen:t,reason:`start_position_reset`}),this.emit(`move-detected`,{fen:t,previous:n,board:this.board}),this.emit(`turn-changed`,t.split(` `)[1])}forceCheck(){this.check(!0)}reset(){this.lastFEN=null,clearTimeout(this.timer)}stop(){this.observer?.disconnect(),clearTimeout(this.timer),this.observer=null}},de=class{constructor(e){this.board=e,document.querySelectorAll(`#chessmate-overlay-root`).forEach(e=>e.remove()),this.root=document.createElement(`div`),this.root.id=`chessmate-overlay-root`,this.root.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999990;
      overflow: visible;
    `,this.svg=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`),this.svg.style.cssText=`position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;overflow:visible;`,this.root.append(this.svg),document.body.append(this.root),this.lastArrow=null,this.onResize=()=>{this.syncSvgView(),this.lastArrow&&this.showArrow(this.lastArrow.uci,this.lastArrow.evaluation,this.lastArrow.depth)},window.addEventListener(`resize`,this.onResize),window.addEventListener(`scroll`,this.onResize,{passive:!0}),typeof ResizeObserver<`u`&&this.board&&(this.resizeObserver=new ResizeObserver(()=>this.onResize()),this.resizeObserver.observe(this.board))}syncSvgView(){if(!this.svg)return;let e=window.innerWidth,t=window.innerHeight;this.svg.setAttribute(`viewBox`,`0 0 ${e} ${t}`),this.svg.setAttribute(`width`,`${e}`),this.svg.setAttribute(`height`,`${t}`)}showArrow(e,t,n){if(!e||e.length<4)return;this.lastArrow={uci:e,evaluation:t,depth:n};let r=this.board&&this.board.isConnected?this.board:D();if(!r)return;this.board=r,document.body.contains(this.root)||document.body.append(this.root),this.syncSvgView();let i=e.slice(0,2),a=e.slice(2,4),o=j(this.board,i);if(!o)return;let s=j(this.board,a,o,i);if(!s)return;let c=o.width||60,l=Math.atan2(s.y-o.y,s.x-o.x),u=Math.max(16,Math.min(32,c*.42)),d=Math.PI/5.5,f=s.x-u*Math.cos(l-d),p=s.y-u*Math.sin(l-d),m=s.x-u*Math.cos(l+d),h=s.y-u*Math.sin(l+d),g=s.x-u*.45*Math.cos(l),_=s.y-u*.45*Math.sin(l),v=Math.max(10,Math.min(22,c*.28)),y=Math.max(3.5,Math.min(7,c*.09)),b=Math.max(6,Math.min(14,c*.17)),x=``,S=e.length===5?e[4].toLowerCase():null;if(!S&&(i[1]===`7`&&a[1]===`8`||i[1]===`2`&&a[1]===`1`)&&(S=`q`),S){let e={q:{label:`Phong Hậu`,icon:`👑`,color:`#c084fc`},n:{label:`Phong Mã`,icon:`♞`,color:`#f59e0b`},r:{label:`Phong Xe`,icon:`♜`,color:`#38bdf8`},b:{label:`Phong Tượng`,icon:`♝`,color:`#34d399`}},t=e[S]||e.q,n=s.y-c*.48;x=`
        <g transform="translate(${s.x}, ${n})" filter="url(#cm-glow)">
          <rect x="-44" y="-13" width="88" height="26" rx="13" fill="#0f172a" stroke="${t.color}" stroke-width="2" opacity="0.96"/>
          <text x="0" y="4.5" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif">
            ${t.icon} ${t.label}
          </text>
        </g>
      `}this.svg.innerHTML=`
      <defs>
        <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <!-- Source piece center circle -->
      <circle cx="${o.x}" cy="${o.y}" r="${v}" fill="#22c55e" opacity="0.45" filter="url(#cm-glow)"/>
      <circle cx="${o.x}" cy="${o.y}" r="${y}" fill="#ffffff" opacity="0.9"/>
      <!-- Arrow shaft -->
      <line x1="${o.x}" y1="${o.y}" x2="${g}" y2="${_}" stroke="#22c55e" stroke-width="${b}" stroke-linecap="round" opacity="0.85" filter="url(#cm-glow)"/>
      <!-- Arrow tip polygon centered precisely on target square -->
      <polygon points="${s.x},${s.y} ${f},${p} ${m},${h}" fill="#22c55e" opacity="0.9" filter="url(#cm-glow)"/>
      <!-- Promotion Badge if pawn reaches last rank -->
      ${x}
    `}clear(){this.lastArrow=null,this.svg.innerHTML=``}destroy(){this.lastArrow=null,this.resizeObserver&&=(this.resizeObserver.disconnect(),null),this.onResize&&(window.removeEventListener(`resize`,this.onResize),window.removeEventListener(`scroll`,this.onResize)),this.root?.remove(),this.root=null,this.board=null}},fe=`https://raw.githubusercontent.com/userlethekhoi/ChessMate/main/version.json`;function pe(e,t){let n=String(e||`0.0.0`).split(`.`).map(e=>parseInt(e,10)||0),r=String(t||`0.0.0`).split(`.`).map(e=>parseInt(e,10)||0);for(let e=0;e<Math.max(n.length,r.length);e++){let t=n[e]||0,i=r[e]||0;if(i>t)return 1;if(i<t)return-1}return 0}async function I(e=null){let t=typeof chrome<`u`&&chrome.runtime?.getManifest?.()?.version||`0.1.0`,n=e||fe;try{let e=new AbortController,r=setTimeout(()=>e.abort(),4e3),i=await fetch(`${n}?_t=${Date.now()}`,{signal:e.signal,headers:{"Cache-Control":`no-cache`}});if(clearTimeout(r),!i.ok)return{hasUpdate:!1,currentVersion:t,error:`HTTP ${i.status}`};let a=await i.json(),o=a.version;if(!o)return{hasUpdate:!1,currentVersion:t};let s={hasUpdate:pe(t,o)>0,currentVersion:t,latestVersion:o,changelog:a.changelog||[],releaseDate:a.releaseDate||``,downloadUrl:a.downloadUrl||`https://github.com/userlethekhoi/Extension-Chess.Com/releases/latest`};return typeof chrome<`u`&&chrome.storage?.local&&chrome.storage.local.set({otaUpdateInfo:s}).catch(()=>{}),s}catch(e){return{hasUpdate:!1,currentVersion:t,error:e.message}}}var L=[{id:`fork`,title:`Đòn Chĩa Đôi (Fork)`,tag:`Tấn Công Kép`,desc:`Một quân cờ tấn công cùng lúc hai hoặc nhiều quân đối phương (đặc biệt là Vua + Hậu/Xe).`,detail:`Hiệp sĩ (Mã) và Tốt là hai quân tạo đòn chĩa bất ngờ và nguy hiểm nhất vì đường đi đặc thù không thể bị chặn.`,tips:`Luôn chú ý các ô nhảy của Mã vào ô c7/c2 (chĩa Vua và Xe) hoặc f7/f2.`},{id:`pin`,title:`Đòn Ghim Quân (Pin)`,tag:`Khống Chế`,desc:`Làm tê liệt quân đối phương bằng cách ghim nó vào một quân có giá trị cao hơn phía sau.`,detail:`Ghim tuyệt đối: Quân bị ghim trước Vua không được phép di chuyển (phạm luật). Ghim tương đối: Quân bị ghim trước Hậu hoặc Xe di chuyển sẽ làm mất quân lớn phía sau.`,tips:`Tượng, Xe và Hậu là 3 quân duy nhất có thể thực hiện đòn ghim trên đường thẳng và đường chéo.`},{id:`skewer`,title:`Đòn Xiên (Skewer)`,tag:`Đột Kích Hàng Dọc`,desc:`Tấn công quân lớn hơn ở phía trước buộc nó phải chạy, để lộ quân phòng thủ yếu hơn ở phía sau.`,detail:`Ngược lại với đòn Ghim: Quân đứng trước có giá trị cao hơn (như Vua hoặc Hậu). Khi Vua bị chiếu phải né, quân đứng sau sẽ bị tiêu diệt.`,tips:`Rất hay xuất hiện trong tàn cuộc Xe khi Vua đối thủ đứng cùng hàng ngang/dọc với Xe của họ.`},{id:`discovered_attack`,title:`Đòn Chiếu Mở (Discovered Attack)`,tag:`Đòn Đột Kích`,desc:`Di chuyển một quân để mở đường cho quân tầm xa phía sau chiếu Vua hoặc tấn công mục tiêu hiểm hóc.`,detail:`Quân di chuyển có thể đi đến bất kỳ đâu (thậm chí thí mạng hoặc ăn không quân khác) vì đối thủ bắt buộc phải đối phó với đòn chiếu từ quân phía sau.`,tips:`Nếu quân di chuyển cũng đồng thời chiếu Vua, đó là đòn "Chiếu Kép" (Double Check) - đối thủ chỉ có thể chạy Vua!`},{id:`deflection`,title:`Đòn Đánh Lạc Hướng (Deflection)`,tag:`Phá Vỡ Phòng Thủ`,desc:`Ép buộc hoặc dụ dỗ quân phòng thủ then chốt của đối phương rời bỏ vị trí bảo vệ.`,detail:`Thí quân nhẹ hoặc chiếu bắt buộc để lôi kéo Hậu/Xe/Vua đối phương rời xa ô trọng yếu, mở đường cho đòn kết liễu.`,tips:`Tìm quân đang làm nhiệm vụ "duy nhất bảo vệ một mục tiêu sống còn" và tìm cách đuổi hoặc thí quân tiêu diệt nó.`},{id:`back_rank_mate`,title:`Đòn Chiếu Hết Hàng Đáy (Back-Rank Mate)`,tag:`Chiếu Bí`,desc:`Xe hoặc Hậu thâm nhập vào hàng 8 (hoặc hàng 1) chiếu Vua khi các tốt phía trước chặn mất đường thoát.`,detail:`Khi đối thủ nhập thành mà chưa mở "cửa sổ" (đẩy tốt h6/g6 hoặc h3/g3), Vua sẽ bị nhốt chặt sau bức tường tốt của chính mình.`,tips:`Luôn chủ động mở một lỗ thông hơi (Luft) cho Vua bằng nước h3/h6 khi thế trận có nguy cơ bị tấn công hàng đáy.`},{id:`smothered_mate`,title:`Đòn Chiếu Bí Nghẹt Thở (Smothered Mate)`,tag:`Chiến Thuật`,desc:`Vua đối phương bị bao vây tứ phía bởi chính quân mình ở góc bàn cờ và bị Mã chiếu bí không lối thoát.`,detail:`Đòn phối hợp kinh điển thường bắt đầu bằng việc thí Hậu vào ô g8/g1 ép Xe đối phương phải ăn vào, bịt kín ô thoát cuối cùng của Vua.`,tips:`Đòn này chỉ có thể thực hiện bởi quân Mã (quân cờ duy nhất có thể nhảy qua đầu quân khác).`},{id:`perpetual_defense`,title:`Chiếu Vĩnh Cửu & Hòa Thế Bí (Fortress & Stalemate)`,tag:`Phòng Thủ Cầu Hòa`,desc:`Kỹ năng sinh tồn khi bị lép vế: Chiếu lặp lại không ngừng hoặc tạo thế Vua không có nước đi hợp lệ.`,detail:`Khi đang thua chất hoặc bị dồn ép nghẹt thở, hãy tìm mọi cách thí hết các quân còn lại để Vua rơi vào thế Bức Bí (Stalemate = Hòa cờ ngay lập tức) hoặc dùng Hậu/Xe chiếu liên tục 3 lần lặp lại.`,tips:`Đừng vội đầu hàng! Trong cờ vua, một trận hòa từ thế cờ thua chất là chiến thắng ngoạn mục của tư duy phòng thủ!`}],R=class{constructor({onReanalyze:e,onModeChange:t,onNewGame:n}){this.onReanalyze=e,this.onModeChange=t,this.onNewGame=n,this.root=null,this.bubble=null,this.isMinimized=!1,this.currentTab=`chat`,this.moveHistory=[],this.currentFen=null,this.lastBestMove=null,this.lastEvaluation=0,this.lastEfficiencyNote=null,this.activeMode=`fastest_win`,this.config={},this.isAnalyzing=!1,this.userColor=`w`,this.isMyTurn=!0,this.sideOverride=null,this.otaInfo=null,this.init()}init(){document.querySelectorAll(`#chessmate-hud-root, #chessmate-bubble-root`).forEach(e=>e.remove()),this.createStyles(),this.createBubble(),this.createWindow(),this.attachDragEvents(),I().then(e=>{e&&e.hasUpdate&&(this.otaInfo=e,this.renderBody())}).catch(()=>{})}createStyles(){if(document.getElementById(`chessmate-hud-styles`))return;let e=document.createElement(`style`);e.id=`chessmate-hud-styles`,e.textContent=`
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
        gap: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 6px;
      }

      .cm-tag {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 3px 7px;
        border-radius: 2px;
        background: rgba(229, 155, 44, 0.12);
        color: #e59b2c;
        border: 1px solid rgba(229, 155, 44, 0.3);
        text-transform: uppercase;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .cm-eval-chip {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        font-weight: 800;
        color: #2dd4bf;
        background: rgba(45, 212, 191, 0.12);
        border: 1px solid rgba(45, 212, 191, 0.3);
        padding: 2px 7px;
        border-radius: 2px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .cm-eval-subrow {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #94a3b8;
        line-height: 1.35;
        margin-top: -2px;
      }

      .cm-eval-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2dd4bf;
        display: inline-block;
        flex-shrink: 0;
      }

      /* Promotion Advice Box */
      .cm-promo-box {
        margin-top: 4px;
        padding: 8px 10px;
        background: rgba(147, 51, 234, 0.12);
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cm-promo-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .cm-promo-title {
        font-size: 11px;
        font-weight: 800;
        color: #c084fc;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .cm-promo-badge {
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 2px;
        background: rgba(229, 155, 44, 0.2);
        color: #e59b2c;
        border: 1px solid rgba(229, 155, 44, 0.4);
        white-space: nowrap;
      }

      .cm-promo-desc {
        font-size: 11px;
        color: #e2e8f0;
        line-height: 1.4;
      }

      /* Material Bar & Exchange Evaluation */
      .cm-material-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0b0e14;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        padding: 5px 10px;
        font-size: 11px;
        margin-bottom: 6px;
      }

      .cm-mat-scores {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-weight: 700;
        color: #d1d5db;
      }

      .cm-mat-lead {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 2px;
        white-space: nowrap;
      }

      .cm-strat-box {
        margin-top: 4px;
        padding: 8px 10px;
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cm-strat-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }

      .cm-strat-title {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cm-strat-tag {
        font-size: 9px;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        white-space: nowrap;
      }

      .cm-strat-advice {
        font-size: 11px;
        color: #cbd5e1;
        line-height: 1.45;
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

      .cm-btn-secondary {
        background: #1e222a;
        color: #d1d5db;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 6px 10px;
        border-radius: 2px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.4px;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.15s ease;
      }

      .cm-btn-secondary:hover {
        background: #282e39;
        color: #ffffff;
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

      /* OTA Update Banner */
      .cm-ota-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(90deg, rgba(147, 51, 234, 0.25), rgba(59, 130, 246, 0.25));
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 3px;
        padding: 6px 10px;
        font-size: 11px;
        color: #f3e8ff;
        margin-bottom: 6px;
      }

      .cm-ota-text {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cm-ota-btn {
        background: #9333ea;
        color: #ffffff !important;
        text-decoration: none;
        padding: 3px 8px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.4px;
        transition: background 0.15s;
        white-space: nowrap;
      }

      .cm-ota-btn:hover {
        background: #a855f7;
      }

      /* Mobile Touch & Responsive Bottom Sheet */
      @media (max-width: 640px), (max-height: 700px) {
        #chessmate-hud-root {
          left: 8px !important;
          right: 8px !important;
          bottom: 8px !important;
          top: auto !important;
          width: auto !important;
          max-width: 100vw !important;
          height: 380px !important;
          max-height: 48vh !important;
          border-radius: 8px !important;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.9) !important;
        }

        #chessmate-bubble-root {
          bottom: 16px !important;
          right: 16px !important;
          padding: 10px 16px !important;
          border-radius: 24px !important;
          font-size: 11px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.75) !important;
        }

        .cm-hud-header {
          padding: 8px 12px;
        }

        .cm-tab-btn {
          padding: 8px 0;
          font-size: 11px;
          touch-action: manipulation;
        }

        .cm-side-btn {
          padding: 5px 10px !important;
          font-size: 11px !important;
          touch-action: manipulation;
        }

        .cm-btn-ctl {
          width: 32px;
          height: 28px;
        }
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
        <div style="display:flex;gap:6px;">
          <button class="cm-btn-secondary" id="cm-btn-new-game" title="Bắt đầu ván mới (reset toàn bộ)">
            VÁN MỚI
          </button>
          <button class="cm-btn-reanalyze" id="cm-btn-reanalyze">
            QUÉT LẠI
          </button>
        </div>
      </div>
    `,document.body.append(this.root),this.root.querySelector(`#cm-btn-min`).onclick=e=>{e.stopPropagation(),this.minimize()},this.root.querySelector(`#cm-btn-close`).onclick=e=>{e.stopPropagation(),this.close()},this.root.querySelectorAll(`.cm-tab-btn`).forEach(e=>{e.onclick=()=>{this.root.querySelectorAll(`.cm-tab-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),this.currentTab=e.getAttribute(`data-tab`),this.renderBody()}}),this.root.querySelector(`#cm-btn-new-game`).onclick=()=>{this.status(`[VÁN CỜ MỚI]`,!0),this.onNewGame?.()},this.root.querySelector(`#cm-btn-reanalyze`).onclick=()=>{this.status(`[ĐANG QUÉT BÀN CỜ...]`,!0),this.onReanalyze?.()},this.renderBody()}minimize(){this.isMinimized=!0,this.root.classList.add(`minimized`),setTimeout(()=>{this.root.classList.add(`hidden`),this.bubble.classList.remove(`hidden`)},150)}restore(){this.isMinimized=!1,this.bubble.classList.add(`hidden`),this.root.classList.remove(`hidden`),setTimeout(()=>{this.root.classList.remove(`minimized`)},20)}close(){this.root.classList.add(`hidden`),this.bubble.classList.add(`hidden`),i({showHud:!1}).catch(()=>{})}show(){this.root.classList.remove(`hidden`),this.isMinimized?this.bubble.classList.remove(`hidden`):this.root.classList.remove(`minimized`)}status(e,t=!1){this.isAnalyzing=t;let n=this.root.querySelector(`#cm-status-text`);n&&(n.textContent=e);let r=this.bubble?.querySelector(`#cm-bubble-text`);r&&(r.textContent=e)}reset(){this.moveHistory=[],this.currentFen=null,this.lastBestMove=null,this.lastEvaluation=0,this.status(`Ván cờ mới: Sẵn sàng`),this.renderBody();let e=this.bubble?.querySelector(`#cm-bubble-text`);e&&(e.textContent=`ChessMate AI`)}updateConfig(e){this.config={...this.config,...e},e.thinkingMode&&e.thinkingMode!==this.activeMode&&(this.activeMode=e.thinkingMode,this.renderBody()),e.showHud===!1?this.close():e.showHud===!0&&this.root.classList.contains(`hidden`)&&this.bubble.classList.contains(`hidden`)&&this.show()}updateAnalysis({fen:e,uci:t,evaluation:n,depth:r,userColor:i=`w`,isMyTurn:a=!0,playedMoves:o=[],efficiencyNote:s=null}){this.currentFen=e,this.lastBestMove=t,this.lastEvaluation=n,this.lastEfficiencyNote=s,this.userColor=this.sideOverride||i,this.isMyTurn=a;let c=p(t,e),l=d(n);this.isMyTurn?((this.moveHistory.length===0||this.moveHistory[0].uci!==t)&&(this.moveHistory.unshift({uci:t,time:new Date().toLocaleTimeString(),short:c.short||t,title:c.title,eval:l}),this.moveHistory.length>20&&this.moveHistory.pop()),this.status(`[LƯỢT BẠN] ${t.toUpperCase()} (D${r})`,!1)):this.status(`[ĐỐI THỦ ĐANG NGHĨ] Đang chờ đối thủ...`,!1),this.renderBody();let u=this.bubble?.querySelector(`#cm-bubble-text`);u&&(u.textContent=this.isMyTurn?`[${t.toUpperCase()}] ${c.short||``}`:`[ĐỢI ĐỐI THỦ]`)}renderBody(){let e=this.root.querySelector(`#cm-hud-body`);e&&(this.currentTab===`chat`?this.renderChatTab(e):this.currentTab===`modes`?this.renderModesTab(e):this.currentTab===`book`&&this.renderBookTab(e))}renderChatTab(e){let t=this.lastBestMove?p(this.lastBestMove,this.currentFen):null,n=s(this.lastEvaluation);l(this.activeMode);let r=this.sideOverride||this.userColor,i=r===`w`?`Trắng ⚪`:`Đen ⚫`,o=r===`w`?`Đen ⚫`:`Trắng ⚪`,c=u(this.currentFen),d=f({fen:this.currentFen,uci:this.lastBestMove,evaluation:this.lastEvaluation,userColor:r}),m=``;if(this.otaInfo&&this.otaInfo.hasUpdate){let e=this.otaInfo.changelog&&this.otaInfo.changelog[0]?this.otaInfo.changelog[0]:`Đã có bản cập nhật mới!`;m+=`
        <div class="cm-ota-banner">
          <div class="cm-ota-text">
            <span>🚀</span>
            <span><strong>v${this.otaInfo.latestVersion}</strong>: ${e}</span>
          </div>
          <a class="cm-ota-btn" href="${this.otaInfo.downloadUrl||`https://github.com/userlethekhoi/Extension-Chess.Com/releases/latest`}" target="_blank" rel="noopener noreferrer">CẬP NHẬT</a>
        </div>
      `}if(m+=`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#0d1117;border:1px solid rgba(255,255,255,0.08);border-radius:4px;margin-bottom:6px;font-size:11px;">
        <span style="color:#9ca3af;font-weight:600;">Bạn cầm quân:</span>
        <div style="display:flex;gap:4px;">
          <button class="cm-side-btn" data-side="w" style="padding:3px 8px;font-size:10px;border-radius:2px;cursor:pointer;background:${r===`w`?`#e59b2c`:`#1e222a`};color:${r===`w`?`#000`:`#d1d5db`};border:1px solid rgba(255,255,255,0.1);font-weight:700;">⚪ TRẮNG</button>
          <button class="cm-side-btn" data-side="b" style="padding:3px 8px;font-size:10px;border-radius:2px;cursor:pointer;background:${r===`b`?`#e59b2c`:`#1e222a`};color:${r===`b`?`#000`:`#d1d5db`};border:1px solid rgba(255,255,255,0.1);font-weight:700;">⚫ ĐEN</button>
          <button class="cm-side-btn" data-side="auto" style="padding:3px 6px;font-size:10px;border-radius:2px;cursor:pointer;background:${this.sideOverride?`#1e222a`:`#374151`};color:${this.sideOverride?`#6b7280`:`#fff`};border:1px solid rgba(255,255,255,0.1);" title="Tự động nhận diện bên theo hướng xoay bàn cờ">TỰ ĐỘNG</button>
        </div>
      </div>
    `,c){let e=r===`w`?c.whiteScore:c.blackScore,t=r===`w`?c.blackScore:c.whiteScore,n=Math.round((e-t)*10)/10,i=``;i=n>.5?`<span class="cm-mat-lead" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4);">Bạn hơn +${n}đ</span>`:n<-.5?`<span class="cm-mat-lead" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4);">Đối thủ hơn +${Math.abs(n)}đ</span>`:`<span class="cm-mat-lead" style="background:rgba(255,255,255,0.08);color:#94a3b8;border:1px solid rgba(255,255,255,0.15);">Lực lượng cân bằng</span>`,m+=`
        <div class="cm-material-bar">
          <div class="cm-mat-scores">
            <span>Bạn: <strong style="color:#ffffff;">${e}đ</strong></span>
            <span style="color:#64748b;">⚔️</span>
            <span>Địch: <strong style="color:#ffffff;">${t}đ</strong></span>
          </div>
          ${i}
        </div>
      `}if(t&&this.lastBestMove){let e=d?`
        <div class="cm-strat-box" style="border-left: 3px solid ${d.color};">
          <div class="cm-strat-head">
            <span class="cm-strat-title" style="color: ${d.color};">${d.badge}</span>
            <span class="cm-strat-tag">${d.tag}</span>
          </div>
          <div class="cm-strat-advice">${d.advice}</div>
        </div>
      `:``,r=this.lastEfficiencyNote?`
        <div style="display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:700;color:#38bdf8;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:2px;padding:4px 8px;margin-top:2px;">
          <span>⚡</span>
          <span>${this.lastEfficiencyNote}</span>
        </div>
      `:``;if(this.isMyTurn){let a=t.promotion?`
          <div class="cm-promo-box">
            <div class="cm-promo-head">
              <span class="cm-promo-title">⭐ KHUYÊN DÙNG: PHONG ${t.promoName?.toUpperCase()||`HẬU`} ${t.promoSymbol||`👑`}</span>
              ${t.promotion===`q`?`<span class="cm-promo-badge">TỐI ƯU HỎA LỰC +9</span>`:`<span class="cm-promo-badge" style="background:rgba(239,68,68,0.2);color:#f87171;border-color:rgba(239,68,68,0.4);">⚡ UNDERPROMOTION</span>`}
            </div>
            <div class="cm-promo-desc">
              ${t.desc}
            </div>
          </div>
        `:``;m+=`
          <div class="cm-card" style="border: 1px solid rgba(34, 197, 94, 0.45); box-shadow: 0 0 14px rgba(34,197,94,0.12);">
            <div class="cm-card-head">
              <span class="cm-tag" style="background:rgba(34,197,94,0.15);color:#22c55e;border-color:rgba(34,197,94,0.4);">
                LƯỢT CỦA BẠN (${i})
              </span>
              <span class="cm-eval-chip" title="${n.full}">${n.numeric}</span>
            </div>
            <div class="cm-eval-subrow">
              <span class="cm-eval-dot"></span>
              <span>${n.desc}</span>
            </div>

            <div class="cm-instruction" style="color:#22c55e;font-size:14px;font-weight:700;">
              ${t.title}
            </div>
            <div class="cm-reason">
              <strong>Chiến thuật:</strong> ${t.desc}
            </div>

            ${e}
            ${r}
            ${a}

            <div class="cm-explain-box">
              <button class="cm-btn-explain" id="cm-btn-ai-explain">
                PHÂN TÍCH CHIẾN THUẬT SÂU
              </button>
              <div id="cm-ai-result-box" style="display:none;" class="cm-explain-result"></div>
            </div>
          </div>
        `}else m+=`
          <div class="cm-card" style="border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(20, 23, 29, 0.95);">
            <div class="cm-card-head">
              <span class="cm-tag" style="background:rgba(234,179,8,0.15);color:#eab308;border-color:rgba(234,179,8,0.4);">
                LƯỢT ĐỐI THỦ (${o})
              </span>
              <span class="cm-eval-chip" style="color:#eab308;background:rgba(234,179,8,0.12);border-color:rgba(234,179,8,0.3);" title="${n.full}">${n.numeric}</span>
            </div>
            <div class="cm-eval-subrow">
              <span class="cm-eval-dot" style="background:#eab308;"></span>
              <span>${n.desc}</span>
            </div>

            <div class="cm-instruction" style="color:#eab308;font-size:13px;font-weight:600;">
              Đang đợi đối thủ (${o}) đi nước cờ...
            </div>
            <div class="cm-reason" style="font-size:11px;color:#9ca3af;line-height:1.5;">
              <strong>Dự đoán nước tốt nhất của đối thủ:</strong> ${t.title}
              <br><span style="color:#6b7280;">Hệ thống sẽ gợi ý nước cờ chuẩn cho bạn ngay khi đối thủ đi xong.</span>
            </div>

            ${e}
          </div>
        `}else m+=`
        <div class="cm-card" style="text-align: center; padding: 28px 12px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">ĐANG CHỜ LƯỢT ĐI</div>
          <div style="font-size: 11px; color: #808893; line-height: 1.45;">
            Hệ thống tự động phân tích và đưa ra tên quân cờ kèm ô di chuyển khi đến lượt bạn.
          </div>
        </div>
      `;if(this.moveHistory.length>0){m+=`
        <div class="cm-history-title">LỊCH SỬ GỢI Ý GẦN ĐÂY</div>
        <div class="cm-history-list">
      `;for(let e of this.moveHistory.slice(0,5))m+=`
          <div class="cm-history-item">
            <strong>${e.title}</strong>
            <div class="cm-meta">${e.eval} - ${e.time}</div>
          </div>
        `;m+=`</div>`}e.innerHTML=m,e.querySelectorAll(`.cm-side-btn`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-side`);this.sideOverride=t===`auto`?null:t,this.onReanalyze?this.onReanalyze():this.renderBody()}});let h=e.querySelector(`#cm-btn-ai-explain`);h&&(h.onclick=async()=>{let t=e.querySelector(`#cm-ai-result-box`);if(t){t.style.display=`block`,t.textContent=`[HỆ THỐNG] Đang phân tích cấu trúc ván cờ...`;try{if(!this.config.llmApiKey){t.innerHTML=`
              <strong>Phân tích cơ bản:</strong> Nước cờ <strong>${this.lastBestMove.toUpperCase()}</strong> giúp củng cố trung tâm, kiểm soát đường cơ động và loại bỏ điểm yếu chiến lược.
              <br><br>
              <span style="color:#808893;">(Ghi chú: Nhập API Key trong menu tiện ích để mở khóa giải thích văn bản chi tiết).</span>
            `;return}t.textContent=await a({fen:this.currentFen,move:this.lastBestMove,evaluation:this.lastEvaluation,userColor:this.sideOverride||this.userColor,provider:this.config.llmProvider||`gemini`,apiKey:this.config.llmApiKey,endpoint:this.config.llmEndpoint||``,model:this.config.llmModel||``})}catch(e){t.textContent=`[LỖI] ${e.message||String(e)}`}}})}renderModesTab(e){let t=`
      <div style="font-size: 11px; color: #808893; margin-bottom: 4px;">
        Chọn mục tiêu tính toán của động cơ Stockfish:
      </div>
      <div class="cm-modes-grid">
    `;for(let[e,n]of Object.entries(c)){let r=e===this.activeMode;t+=`
        <div class="cm-mode-tile ${r?`selected`:``}" data-mode="${e}">
          <div class="cm-mode-tile-title">
            <span>${n.name}</span>
            ${r?`<span style="color:#e59b2c; font-size:10px;">[ĐANG DÙNG]</span>`:``}
          </div>
          <div class="cm-mode-tile-desc">${n.description}</div>
        </div>
      `}t+=`</div>`,e.innerHTML=t,e.querySelectorAll(`.cm-mode-tile`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-mode`);this.activeMode=t,i({thinkingMode:t}).catch(()=>{}),this.onModeChange?.(t),this.renderBody(),this.status(`[CHẾ ĐỘ] ${l(t).badge}`)}})}renderBookTab(e){let t=`
      <div style="font-size: 11px; color: #808893; margin-bottom: 6px;">
        Cẩm nang các bài học chiến thuật chuẩn mực:
      </div>
    `;for(let e of L)t+=`
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
      `;e.innerHTML=t}attachDragEvents(){let e=this.root.querySelector(`#cm-drag-handle`);if(!e)return;let t=!1,n=0,r=0,i=0,a=0;e.onmousedown=e=>{if(e.target.closest(`button`))return;t=!0,n=e.clientX,r=e.clientY;let o=this.root.getBoundingClientRect();i=o.left,a=o.top,this.root.style.bottom=`auto`,this.root.style.right=`auto`,this.root.style.left=`${i}px`,this.root.style.top=`${a}px`;let s=e=>{if(!t)return;let o=e.clientX-n,s=e.clientY-r,c=window.innerWidth-this.root.offsetWidth-10,l=window.innerHeight-this.root.offsetHeight-10,u=Math.max(10,Math.min(c,i+o)),d=Math.max(10,Math.min(l,a+s));this.root.style.left=`${u}px`,this.root.style.top=`${d}px`},c=()=>{t=!1,document.removeEventListener(`mousemove`,s),document.removeEventListener(`mouseup`,c)};document.addEventListener(`mousemove`,s),document.addEventListener(`mouseup`,c)},e.ontouchstart=e=>{if(e.target.closest(`button`)||!e.touches||e.touches.length===0)return;let o=e.touches[0];t=!0,n=o.clientX,r=o.clientY;let s=this.root.getBoundingClientRect();i=s.left,a=s.top;let c=e=>{if(!t||!e.touches||e.touches.length===0)return;let o=e.touches[0],s=o.clientX-n,c=o.clientY-r;if(c>100&&Math.abs(s)<60){t=!1,l(),this.minimize();return}let u=window.innerWidth-this.root.offsetWidth-8,d=window.innerHeight-this.root.offsetHeight-8,f=Math.max(8,Math.min(u,i+s)),p=Math.max(8,Math.min(d,a+c));this.root.style.bottom=`auto`,this.root.style.right=`auto`,this.root.style.left=`${f}px`,this.root.style.top=`${p}px`},l=()=>{t=!1,document.removeEventListener(`touchmove`,c),document.removeEventListener(`touchend`,l),document.removeEventListener(`touchcancel`,l)};document.addEventListener(`touchmove`,c,{passive:!0}),document.addEventListener(`touchend`,l),document.addEventListener(`touchcancel`,l)}}},z=(e,t)=>new Promise(n=>setTimeout(n,e+Math.random()*Math.max(0,t-e)));function me(e,t,n=10){let r={x:e.x+(t.x-e.x)*.3,y:e.y+(Math.random()-.5)*80},i={x:e.x+(t.x-e.x)*.7,y:t.y+(Math.random()-.5)*80};return Array.from({length:n},(a,o)=>{let s=(o+1)/n,c=1-s;return{x:c**3*e.x+3*c**2*s*r.x+3*c*s**2*i.x+s**3*t.x,y:c**3*e.y+3*c**2*s*r.y+3*c*s**2*i.y+s**3*t.y}})}function B(e,t,n,r){r.dispatchEvent(new MouseEvent(e,{bubbles:!0,clientX:t,clientY:n,buttons:e===`mouseup`?0:1}))}function he(e,n){let r=n[1],i=n[0];for(let n of t(r,i)){let t=e.querySelector(n);if(t)return t}return null}async function ge(e,t,{delayMin:n=800,delayMax:r=2500}={}){let i=x(t);if(!i)throw Error(`Invalid UCI move: `+t);let a=e.getBoundingClientRect(),o=e.classList.contains(`flipped`),s=S(i.from,a,o),c=S(i.to,a,o),l=he(e,i.from)||e;await z(n,r),B(`mousedown`,s.x,s.y,l);let u=8+Math.floor(Math.random()*8);for(let e of me(s,c,u))B(`mousemove`,e.x+(Math.random()*4-2),e.y+(Math.random()*4-2),document),await z(8,25);if(B(`mouseup`,c.x,c.y,e),await z(80,160),B(`click`,s.x,s.y,l),await z(80,160),B(`click`,c.x,c.y,e),i.promotion){let e=i.promotion.toLowerCase();await z(150,300);let t=[`.promotion-piece.w${e}`,`.promotion-piece.b${e}`,`.promotion-piece.${e}`,`[data-piece="w${e}"]`,`[data-piece="b${e}"]`,`[data-piece="${e}"]`,`.promotion-window .${e}`,`.promotion-menu .${e}`];for(let e of t){let t=document.querySelector(e);if(t){let e=t.getBoundingClientRect();B(`click`,e.left+e.width/2,e.top+e.height/2,t);break}}}return!0}var V=new ue,H=new h,U,W,G,K,q=!1,J=null,Y=null,X=0;function Z(e=`manual`){m.info(`[ChessMate] Starting new game session (${e})`),X++,H.stop(),W?.clear(),J=null,Y=null,V.reset(),ee(),G?.reset(),r()}async function Q(e=0){return D()||(e>=12?null:(await new Promise(t=>setTimeout(t,Math.min(3e3,150*1.5**e))),Q(e+1)))}async function $(e=null){if(!U?.enabled){W?.clear(),G?.status(`ChessMate: Đang tắt`);return}if(document.visibilityState===`hidden`)return;let t=e||V.getCurrentFEN();if(!t){let e=V.getLastDiagnostic()||`Đang quét bàn cờ...`;m.info(`Waiting for valid FEN:`,e),G?.status(e,!0),setTimeout(()=>{if(U?.enabled&&!q){let e=V.getCurrentFEN();if(e&&e!==J)$(e);else{let e=V.getLastDiagnostic()||`Bấm quét lại bàn cờ`;G?.status(`Quét: ${e}`)}}},600);return}if(!e&&t===J){m.info(`[ChessMate] FEN unchanged, skipping analysis.`);return}if(q){m.info(`[ChessMate] New move detected during active analysis. Aborting old for new FEN:`,t),H.stop(),Y=t;return}q=!0,J=t;let n=++X;G?.status(`Đang suy nghĩ nước cờ...`,!0),W?.clear();try{m.info(`Analyzing FEN:`,t,`Mode:`,U.thinkingMode);let e=await H.getBestMove(t,U);if(!U.enabled){W?.clear();return}if(n!==X){m.info(`[ChessMate] Stale analysis result discarded (FEN changed).`);return}let r=t.split(` `)[1]||`w`,i=G?.sideOverride||P(K),a=r===i;G?.updateAnalysis({fen:t,uci:e.move,evaluation:e.evaluation,depth:U.depth,userColor:i,isMyTurn:a,efficiencyNote:e.efficiencyNote}),a&&U.showArrows!==!1&&U.showOverlay!==!1?W?.showArrow(e.move,e.evaluation,U.depth):W?.clear(),a&&U.autoPlay&&await ge(K,e.move,U)}catch(e){if(e.message===`Cancelled`){m.info(`[ChessMate] Previous engine analysis cancelled for newer board position.`);return}m.warn(`Analysis error:`,e),G?.status(`Engine: `+(e.message||`Lỗi`))}finally{if(q=!1,Y){let e=Y;Y=null,$(e)}}}async function _e(){console.log(`%c[ChessMate Agent]`,`color: #22c55e; font-weight: bold;`,`Content script booting on`,window.location.href),U=await n(),G=new R({onReanalyze:()=>$(),onNewGame:()=>{Z(`user_manual_button`),setTimeout(()=>$(),300)},onModeChange:e=>{U.thinkingMode=e,$()}}),G.updateConfig(U);let t=null,r=null,i=e=>{e&&K!==e&&(K&&(m.info(`[ChessMate] Cleaning up previous board session before attaching new board`),t?.(),r?.(),W?.destroy(),Z(`board_replaced`)),K=e,m.info(`Chess board successfully located:`,K),W=new de(K),t=V.on(`move-detected`,async({fen:e})=>{await $(e)}),r=V.on(`new-game`,({reason:e})=>{Z(e),setTimeout(()=>$(),300)}),V.start(K),U.enabled?setTimeout(()=>$(),200):G.status(`ChessMate: Đang tắt`))},a=await Q();if(a)i(a);else{m.info(`Board not found immediately, observing DOM for board appearance...`);let e=new MutationObserver(()=>{let t=D();t&&(e.disconnect(),i(t))});e.observe(document.body,{childList:!0,subtree:!0})}let o=window.location.href,s=()=>{if(window.location.href!==o){m.info(`URL navigation detected from ${o} to ${window.location.href}`),o=window.location.href,Z(`url_change`);let e=D();e&&e!==K?i(e):e&&setTimeout(()=>$(),500)}};setInterval(s,1e3),window.addEventListener(`popstate`,s),e(e=>{let t=!U?.enabled;U={...U,...e},G?.updateConfig(U),U.enabled?t&&U.enabled&&(J=null,$()):(W?.clear(),J=null)}),chrome.runtime?.onMessage?.addListener(e=>{e?.type===`reanalyze`&&$(),(e?.type===`new_game`||e?.type===`reset_session`)&&(Z(`runtime_message`),setTimeout(()=>$(),300)),e?.type===`show_hud`&&G?.show()})}_e().catch(m.error);