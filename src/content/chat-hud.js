import { translateMoveToVietnamese, formatEvaluationVi } from '../utils/chess-translator.js';
import { TACTICAL_LESSONS } from '../ai/chess-book.js';
import { THINKING_MODES, getModeConfig } from '../engine/thinking-modes.js';
import { setConfig } from '../storage/config-manager.js';
import { explainMove } from '../ai/llm-client.js';

export class ChatHUD {
  constructor({ onReanalyze, onModeChange }) {
    this.onReanalyze = onReanalyze;
    this.onModeChange = onModeChange;

    this.root = null;
    this.bubble = null;
    this.isMinimized = false;
    this.currentTab = 'chat'; // 'chat' | 'modes' | 'book'
    this.moveHistory = [];
    this.currentFen = null;
    this.lastBestMove = null;
    this.lastEvaluation = 0;
    this.activeMode = 'mate_hunt';
    this.config = {};
    this.isAnalyzing = false;

    this.init();
  }

  init() {
    // Clean up any existing instances
    document.querySelectorAll('#chessmate-hud-root, #chessmate-bubble-root').forEach(el => el.remove());

    this.createStyles();
    this.createBubble();
    this.createWindow();
    this.attachDragEvents();
  }

  createStyles() {
    if (document.getElementById('chessmate-hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'chessmate-hud-styles';
    style.textContent = `
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
    `;
    document.head.append(style);
  }

  createBubble() {
    this.bubble = document.createElement('div');
    this.bubble.id = 'chessmate-bubble-root';
    this.bubble.className = 'hidden';
    this.bubble.innerHTML = `
      <span id="cm-bubble-text">[CHESSMATE - TRỢ THỦ]</span>
    `;
    this.bubble.onclick = () => this.restore();
    document.body.append(this.bubble);
  }

  createWindow() {
    this.root = document.createElement('div');
    this.root.id = 'chessmate-hud-root';
    this.root.innerHTML = `
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
    `;

    document.body.append(this.root);

    // Event listeners
    this.root.querySelector('#cm-btn-min').onclick = (e) => {
      e.stopPropagation();
      this.minimize();
    };

    this.root.querySelector('#cm-btn-close').onclick = (e) => {
      e.stopPropagation();
      this.close();
    };

    this.root.querySelectorAll('.cm-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.root.querySelectorAll('.cm-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.getAttribute('data-tab');
        this.renderBody();
      };
    });

    this.root.querySelector('#cm-btn-reanalyze').onclick = () => {
      this.status('[ĐANG QUÉT BÀN CỜ...]', true);
      this.onReanalyze?.();
    };

    this.renderBody();
  }

  minimize() {
    this.isMinimized = true;
    this.root.classList.add('minimized');
    setTimeout(() => {
      this.root.classList.add('hidden');
      this.bubble.classList.remove('hidden');
    }, 150);
  }

  restore() {
    this.isMinimized = false;
    this.bubble.classList.add('hidden');
    this.root.classList.remove('hidden');
    setTimeout(() => {
      this.root.classList.remove('minimized');
    }, 20);
  }

  close() {
    this.root.classList.add('hidden');
    this.bubble.classList.add('hidden');
    setConfig({ showHud: false }).catch(() => {});
  }

  show() {
    this.root.classList.remove('hidden');
    if (this.isMinimized) {
      this.bubble.classList.remove('hidden');
    } else {
      this.root.classList.remove('minimized');
    }
  }

  status(text, analyzing = false) {
    this.isAnalyzing = analyzing;
    const el = this.root.querySelector('#cm-status-text');
    if (el) el.textContent = text;
    const bubbleText = this.bubble?.querySelector('#cm-bubble-text');
    if (bubbleText) bubbleText.textContent = text;
  }

  updateConfig(cfg) {
    this.config = { ...this.config, ...cfg };
    if (cfg.thinkingMode && cfg.thinkingMode !== this.activeMode) {
      this.activeMode = cfg.thinkingMode;
      this.renderBody();
    }
    if (cfg.showHud === false) {
      this.close();
    } else if (cfg.showHud === true && this.root.classList.contains('hidden') && this.bubble.classList.contains('hidden')) {
      this.show();
    }
  }

  updateAnalysis({ fen, uci, evaluation, depth, playedMoves = [] }) {
    this.currentFen = fen;
    this.lastBestMove = uci;
    this.lastEvaluation = evaluation;

    const translation = translateMoveToVietnamese(uci, fen);
    const evalText = formatEvaluationVi(evaluation);

    // Update history
    this.moveHistory.unshift({
      time: new Date().toLocaleTimeString(),
      short: translation.short || uci,
      title: translation.title,
      eval: evalText
    });
    if (this.moveHistory.length > 20) this.moveHistory.pop();

    this.renderBody();
    this.status(`[XONG] ${uci.toUpperCase()} (D${depth})`, false);

    // Update bubble title
    const bubbleText = this.bubble?.querySelector('#cm-bubble-text');
    if (bubbleText) bubbleText.textContent = `[${uci.toUpperCase()}] ${translation.short || ''}`;
  }

  renderBody() {
    const body = this.root.querySelector('#cm-hud-body');
    if (!body) return;

    if (this.currentTab === 'chat') {
      this.renderChatTab(body);
    } else if (this.currentTab === 'modes') {
      this.renderModesTab(body);
    } else if (this.currentTab === 'book') {
      this.renderBookTab(body);
    }
  }

  renderChatTab(body) {
    const translation = this.lastBestMove ? translateMoveToVietnamese(this.lastBestMove, this.currentFen) : null;
    const evalText = formatEvaluationVi(this.lastEvaluation);
    const modeCfg = getModeConfig(this.activeMode);

    let html = '';

    if (translation && this.lastBestMove) {
      html += `
        <div class="cm-card">
          <div class="cm-card-head">
            <span class="cm-tag">${modeCfg.badge}</span>
            <span class="cm-eval">${evalText}</span>
          </div>
          <div class="cm-instruction">
            ${translation.title}
          </div>
          <div class="cm-reason">
            <strong>Chiến thuật:</strong> ${translation.desc}
          </div>

          <div class="cm-explain-box">
            <button class="cm-btn-explain" id="cm-btn-ai-explain">
              PHÂN TÍCH CHIẾN THUẬT SÂU
            </button>
            <div id="cm-ai-result-box" style="display:none;" class="cm-explain-result"></div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="cm-card" style="text-align: center; padding: 28px 12px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">ĐANG CHỜ LƯỢT ĐI</div>
          <div style="font-size: 11px; color: #808893; line-height: 1.45;">
            Hệ thống tự động phân tích và đưa ra tên quân cờ kèm ô di chuyển ngay khi đối thủ đi xong.
          </div>
        </div>
      `;
    }

    // Move history
    if (this.moveHistory.length > 0) {
      html += `
        <div class="cm-history-title">LỊCH SỬ GỢI Ý GẦN ĐÂY</div>
        <div class="cm-history-list">
      `;
      for (const item of this.moveHistory.slice(0, 5)) {
        html += `
          <div class="cm-history-item">
            <strong>${item.title}</strong>
            <div class="cm-meta">${item.eval} - ${item.time}</div>
          </div>
        `;
      }
      html += `</div>`;
    }

    body.innerHTML = html;

    // Hook tactical explain button
    const explainBtn = body.querySelector('#cm-btn-ai-explain');
    if (explainBtn) {
      explainBtn.onclick = async () => {
        const resultBox = body.querySelector('#cm-ai-result-box');
        if (!resultBox) return;
        resultBox.style.display = 'block';
        resultBox.textContent = '[HỆ THỐNG] Đang phân tích cấu trúc ván cờ...';

        try {
          if (!this.config.llmApiKey) {
            resultBox.innerHTML = `
              <strong>Phân tích cơ bản:</strong> Nước cờ <strong>${this.lastBestMove.toUpperCase()}</strong> giúp củng cố trung tâm, kiểm soát đường cơ động và loại bỏ điểm yếu chiến lược.
              <br><br>
              <span style="color:#808893;">(Ghi chú: Nhập API Key trong menu tiện ích để mở khóa giải thích văn bản chi tiết).</span>
            `;
            return;
          }

          const explanation = await explainMove({
            fen: this.currentFen,
            move: this.lastBestMove,
            provider: this.config.llmProvider || 'openai',
            apiKey: this.config.llmApiKey
          });
          resultBox.textContent = explanation;
        } catch (err) {
          resultBox.textContent = `[LỖI] ${err.message || String(err)}`;
        }
      };
    }
  }

  renderModesTab(body) {
    let html = `
      <div style="font-size: 11px; color: #808893; margin-bottom: 4px;">
        Chọn mục tiêu tính toán của động cơ Stockfish:
      </div>
      <div class="cm-modes-grid">
    `;

    for (const [key, mode] of Object.entries(THINKING_MODES)) {
      const isSel = key === this.activeMode;
      html += `
        <div class="cm-mode-tile ${isSel ? 'selected' : ''}" data-mode="${key}">
          <div class="cm-mode-tile-title">
            <span>${mode.name}</span>
            ${isSel ? '<span style="color:#e59b2c; font-size:10px;">[ĐANG DÙNG]</span>' : ''}
          </div>
          <div class="cm-mode-tile-desc">${mode.description}</div>
        </div>
      `;
    }

    html += `</div>`;
    body.innerHTML = html;

    body.querySelectorAll('.cm-mode-tile').forEach(card => {
      card.onclick = () => {
        const mode = card.getAttribute('data-mode');
        this.activeMode = mode;
        setConfig({ thinkingMode: mode }).catch(() => {});
        this.onModeChange?.(mode);
        this.renderBody();
        this.status(`[CHẾ ĐỘ] ${getModeConfig(mode).badge}`);
      };
    });
  }

  renderBookTab(body) {
    let html = `
      <div style="font-size: 11px; color: #808893; margin-bottom: 6px;">
        Cẩm nang các bài học chiến thuật chuẩn mực:
      </div>
    `;

    for (const lesson of TACTICAL_LESSONS) {
      html += `
        <div class="cm-book-tile">
          <div class="cm-book-tile-title">
            <span>${lesson.title}</span>
            <span class="cm-tag">${lesson.tag}</span>
          </div>
          <div class="cm-book-tile-desc">
            ${lesson.desc}
            <div class="cm-book-tile-tips">
              Ghi chú: ${lesson.tips}
            </div>
          </div>
        </div>
      `;
    }

    body.innerHTML = html;
  }

  attachDragEvents() {
    const handle = this.root.querySelector('#cm-drag-handle');
    if (!handle) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    handle.onmousedown = (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = this.root.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      this.root.style.bottom = 'auto';
      this.root.style.right = 'auto';
      this.root.style.left = `${initialLeft}px`;
      this.root.style.top = `${initialTop}px`;

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        const maxLeft = window.innerWidth - this.root.offsetWidth - 10;
        const maxTop = window.innerHeight - this.root.offsetHeight - 10;

        const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));

        this.root.style.left = `${newLeft}px`;
        this.root.style.top = `${newTop}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
  }
}
