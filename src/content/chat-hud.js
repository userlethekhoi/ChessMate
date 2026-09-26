import { translateMoveToVietnamese, formatEvaluationVi, formatEvaluationParts, fenToBoard, squareToIndices } from '../utils/chess-translator.js';
import { calculateMaterial, evaluateMoveStrategy, PIECE_VALUES } from '../utils/board-evaluator.js';
import { checkForUpdates } from '../utils/ota-updater.js';
import { TACTICAL_LESSONS } from '../ai/chess-book.js';
import { THINKING_MODES, getModeConfig } from '../engine/thinking-modes.js';
import { setConfig } from '../storage/config-manager.js';
import { explainMove } from '../ai/llm-client.js';

export class ChatHUD {
  constructor({ onReanalyze, onModeChange, onNewGame }) {
    this.onReanalyze = onReanalyze;
    this.onModeChange = onModeChange;
    this.onNewGame = onNewGame;

    this.root = null;
    this.bubble = null;
    this.isMinimized = false;
    this.currentTab = 'chat'; // 'chat' | 'modes' | 'book'
    this.moveHistory = [];
    this.currentFen = null;
    this.lastBestMove = null;
    this.lastEvaluation = 0;
    this.lastEfficiencyNote = null;
    this.activeMode = 'fastest_win';
    this.config = {};
    this.isAnalyzing = false;
    this.userColor = 'w';
    this.isMyTurn = true;
    this.sideOverride = null; // null = auto, 'w' = White, 'b' = Black
    this.otaInfo = null;
    this.isCompact = typeof window !== 'undefined' && window.innerWidth <= 640;

    this.init();
  }

  init() {
    // Clean up any existing instances
    document.querySelectorAll('#chessmate-hud-root, #chessmate-bubble-root').forEach(el => el.remove());

    this.createStyles();
    this.createBubble();
    this.createWindow();
    this.attachDragEvents();

    // Check for OTA updates asynchronously
    checkForUpdates().then(info => {
      if (info && info.hasUpdate) {
        this.otaInfo = info;
        this.renderBody();
      }
    }).catch(() => {});
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

      /* Compact Mini Bar Mode (Non-obstructive dock) */
      #chessmate-hud-root.compact {
        height: 44px !important;
        max-height: 44px !important;
        overflow: hidden !important;
        background: rgba(10, 12, 16, 0.96) !important;
        backdrop-filter: blur(14px) !important;
        border: 1px solid #e59b2c !important;
        border-radius: 6px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.75) !important;
        padding: 0 !important;
      }

      #chessmate-hud-root.compact .cm-hud-header,
      #chessmate-hud-root.compact .cm-hud-tabs,
      #chessmate-hud-root.compact .cm-hud-body,
      #chessmate-hud-root.compact .cm-hud-footer {
        display: none !important;
      }

      #chessmate-hud-root.compact .cm-mini-bar {
        display: flex !important;
      }

      .cm-mini-bar {
        display: none;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 44px;
        padding: 0 10px;
        box-sizing: border-box;
      }

      .cm-mini-info {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
        flex: 1;
        cursor: pointer;
      }

      .cm-mini-badge {
        background: #e59b2c;
        color: #0c0e12;
        font-size: 10px;
        font-weight: 800;
        padding: 3px 6px;
        border-radius: 2px;
        letter-spacing: 0.5px;
        flex-shrink: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      .cm-mini-move {
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cm-mini-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }

      .cm-btn-compact-expand {
        background: #1e222a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #e59b2c;
        padding: 4px 8px;
        border-radius: 2px;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cm-btn-compact-expand:hover {
        background: #e59b2c;
        color: #0c0e12;
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
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
        width: 28px;
        min-width: 28px;
        height: 26px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        padding: 0;
        white-space: nowrap !important;
        overflow: hidden;
        flex-shrink: 0;
        user-select: none;
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
    if (this.isCompact) {
      this.root.classList.add('compact');
    }
    this.root.innerHTML = `
      <!-- Mini Dock Bar (44px non-obstructive bar for mobile) -->
      <div class="cm-mini-bar" id="cm-mini-bar">
        <div class="cm-mini-info" id="cm-mini-info" title="Chạm để mở rộng bảng phân tích chi tiết">
          <span class="cm-mini-badge" id="cm-mini-badge">CHESSMATE</span>
          <span class="cm-mini-move" id="cm-mini-move">Đang chờ lượt đi...</span>
        </div>
        <div class="cm-mini-actions">
          <button class="cm-btn-compact-expand" id="cm-btn-mini-expand" title="Mở rộng HUD">MỞ</button>
          <button class="cm-btn-ctl" id="cm-btn-mini-bubble" title="Thu thành bong bóng">-</button>
        </div>
      </div>

      <div class="cm-hud-header" id="cm-drag-handle">
        <div class="cm-hud-title">CHESSMATE - CỬA SỔ PHÂN TÍCH</div>
        <div class="cm-hud-controls">
          <button class="cm-btn-ctl" id="cm-btn-compact" title="Thu gọn thành thanh mini (không che màn hình)">▼</button>
          <button class="cm-btn-ctl" id="cm-btn-min" title="Thu nhỏ">-</button>
          <button class="cm-btn-ctl close" id="cm-btn-close" title="Tắt hẳn">✕</button>
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
    `;

    document.body.append(this.root);

    // Event listeners
    this.root.querySelector('#cm-btn-compact').onclick = (e) => {
      e.stopPropagation();
      this.compact();
    };

    this.root.querySelector('#cm-btn-mini-expand').onclick = (e) => {
      e.stopPropagation();
      this.expand();
    };

    this.root.querySelector('#cm-mini-info').onclick = () => {
      this.expand();
    };

    this.root.querySelector('#cm-btn-mini-bubble').onclick = (e) => {
      e.stopPropagation();
      this.minimize();
    };

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

    this.root.querySelector('#cm-btn-new-game').onclick = () => {
      this.status('[VÁN CỜ MỚI]', true);
      this.onNewGame?.();
    };

    this.root.querySelector('#cm-btn-reanalyze').onclick = () => {
      this.status('[ĐANG QUÉT BÀN CỜ...]', true);
      this.onReanalyze?.();
    };

    this.renderBody();
  }

  compact() {
    this.isCompact = true;
    this.root.classList.add('compact');
    if (window.innerWidth <= 640) {
      this.root.style.top = 'auto';
      this.root.style.bottom = '8px';
      this.root.style.left = '8px';
      this.root.style.right = '8px';
    }
  }

  expand() {
    this.isCompact = false;
    this.root.classList.remove('compact');
    if (window.innerWidth <= 640) {
      this.root.style.top = 'auto';
      this.root.style.bottom = '8px';
      this.root.style.left = '8px';
      this.root.style.right = '8px';
    }
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

    // Keep mini dock bar in sync so mobile users always see current status
    const miniBadge = this.root?.querySelector('#cm-mini-badge');
    const miniMove = this.root?.querySelector('#cm-mini-move');
    if (miniMove) {
      if (analyzing) {
        if (miniBadge) miniBadge.textContent = 'TÍNH TOÁN';
        miniMove.textContent = text || 'Đang suy nghĩ nước cờ...';
      } else if (text?.startsWith('Engine: ') || text?.startsWith('Quét: ') || text?.startsWith('Lỗi')) {
        if (miniBadge) miniBadge.textContent = 'LỖI';
        miniMove.textContent = text;
      } else if (!this.lastBestMove) {
        miniMove.textContent = text;
      }
    }
  }

  reset() {
    this.moveHistory = [];
    this.currentFen = null;
    this.lastBestMove = null;
    this.lastEvaluation = 0;
    this.status('Ván cờ mới: Sẵn sàng');
    this.renderBody();
    const bubbleText = this.bubble?.querySelector('#cm-bubble-text');
    if (bubbleText) bubbleText.textContent = 'ChessMate AI';
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

  updateAnalysis({ fen, uci, evaluation, depth, userColor = 'w', isMyTurn = true, playedMoves = [], efficiencyNote = null }) {
    this.currentFen = fen;
    this.lastBestMove = uci;
    this.lastEvaluation = evaluation;
    this.lastEfficiencyNote = efficiencyNote;
    this.userColor = this.sideOverride || userColor;

    // Detect actual move color from the piece on the from-square
    let moveColor = null;
    if (fen && uci && uci.length >= 4) {
      const fromSq = uci.slice(0, 2).toLowerCase();
      const fromIdx = squareToIndices(fromSq);
      if (fromIdx) {
        const boardMatrix = fenToBoard(fen);
        const p = boardMatrix?.[fromIdx.row]?.[fromIdx.col];
        if (p) {
          moveColor = (p === p.toUpperCase()) ? 'w' : 'b';
        }
      }
    }

    // A move for the opponent can NEVER be "my turn"
    if (moveColor && moveColor !== this.userColor) {
      this.isMyTurn = false;
    } else {
      this.isMyTurn = isMyTurn;
    }

    const translation = translateMoveToVietnamese(uci, fen);
    const evalText = formatEvaluationVi(evaluation);

    // Only add to moveHistory if it's OUR move
    if (this.isMyTurn) {
      if (this.moveHistory.length === 0 || this.moveHistory[0].uci !== uci) {
        this.moveHistory.unshift({
          uci,
          time: new Date().toLocaleTimeString(),
          short: translation.short || uci,
          title: translation.title,
          eval: evalText
        });
        if (this.moveHistory.length > 20) this.moveHistory.pop();
      }
      this.status(`[LƯỢT BẠN] ${uci.toUpperCase()} (D${depth})`, false);
    } else {
      this.status(`[ĐỐI THỦ ĐANG NGHĨ] Đang chờ đối thủ...`, false);
    }

    this.renderBody();

    // Update mini dock bar in real-time
    const miniBadge = this.root.querySelector('#cm-mini-badge');
    const miniMove = this.root.querySelector('#cm-mini-move');
    if (miniBadge && miniMove) {
      if (this.isMyTurn) {
        miniBadge.textContent = `${this.userColor === 'w' ? 'W' : 'B'}: ${uci.toUpperCase()}`;
        miniMove.textContent = `${translation.short || translation.title} (${evalText})`;
      } else {
        miniBadge.textContent = `ĐỢI LƯỢT`;
        miniMove.textContent = `Dự đoán: ${translation.short || translation.title}`;
      }
    }

    // Update bubble title
    const bubbleText = this.bubble?.querySelector('#cm-bubble-text');
    if (bubbleText) {
      if (this.isMyTurn) {
        bubbleText.textContent = `[${uci.toUpperCase()}] ${translation.short || ''}`;
      } else {
        bubbleText.textContent = `[ĐỢI ĐỐI THỦ]`;
      }
    }
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
    const evalParts = formatEvaluationParts(this.lastEvaluation);
    const modeCfg = getModeConfig(this.activeMode);

    const activeSide = this.sideOverride || this.userColor;
    const myColorName = activeSide === 'w' ? 'Trắng' : 'Đen';
    const oppColorName = activeSide === 'w' ? 'Đen' : 'Trắng';

    const material = calculateMaterial(this.currentFen);
    const strat = evaluateMoveStrategy({
      fen: this.currentFen,
      uci: this.lastBestMove,
      evaluation: this.lastEvaluation,
      userColor: activeSide
    });

    let html = '';

    // OTA Update Alert Banner
    if (this.otaInfo && this.otaInfo.hasUpdate) {
      const changelogSnippet = (this.otaInfo.changelog && this.otaInfo.changelog[0]) ? this.otaInfo.changelog[0] : 'Đã có bản cập nhật mới!';
      html += `
        <div class="cm-ota-banner">
          <div class="cm-ota-text">
            <span><strong>v${this.otaInfo.latestVersion}</strong>: ${changelogSnippet}</span>
          </div>
          <a class="cm-ota-btn" href="${this.otaInfo.downloadUrl || 'https://github.com/userlethekhoi/Extension-Chess.Com/releases/latest'}" target="_blank" rel="noopener noreferrer">CẬP NHẬT</a>
        </div>
      `;
    }

    // Side selection bar at top of chat tab
    html += `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#0d1117;border:1px solid rgba(255,255,255,0.08);border-radius:4px;margin-bottom:6px;font-size:11px;">
        <span style="color:#9ca3af;font-weight:600;">Bạn cầm quân:</span>
        <div style="display:flex;gap:4px;">
          <button class="cm-side-btn" data-side="w" style="padding:3px 8px;font-size:10px;border-radius:2px;cursor:pointer;background:${activeSide === 'w' ? '#e59b2c' : '#1e222a'};color:${activeSide === 'w' ? '#000' : '#d1d5db'};border:1px solid rgba(255,255,255,0.1);font-weight:700;">TRẮNG</button>
          <button class="cm-side-btn" data-side="b" style="padding:3px 8px;font-size:10px;border-radius:2px;cursor:pointer;background:${activeSide === 'b' ? '#e59b2c' : '#1e222a'};color:${activeSide === 'b' ? '#000' : '#d1d5db'};border:1px solid rgba(255,255,255,0.1);font-weight:700;">ĐEN</button>
          <button class="cm-side-btn" data-side="auto" style="padding:3px 6px;font-size:10px;border-radius:2px;cursor:pointer;background:${!this.sideOverride ? '#374151' : '#1e222a'};color:${!this.sideOverride ? '#fff' : '#6b7280'};border:1px solid rgba(255,255,255,0.1);" title="Tự động nhận diện bên theo hướng xoay bàn cờ">TỰ ĐỘNG</button>
        </div>
      </div>
    `;

    // Material Balance Bar
    if (material) {
      const myScore = activeSide === 'w' ? material.whiteScore : material.blackScore;
      const oppScore = activeSide === 'w' ? material.blackScore : material.whiteScore;
      const leadDiff = Math.round((myScore - oppScore) * 10) / 10;
      let leadBadge = '';
      if (leadDiff > 0.5) {
        leadBadge = `<span class="cm-mat-lead" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4);">Bạn hơn +${leadDiff}đ</span>`;
      } else if (leadDiff < -0.5) {
        leadBadge = `<span class="cm-mat-lead" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4);">Đối thủ hơn +${Math.abs(leadDiff)}đ</span>`;
      } else {
        leadBadge = `<span class="cm-mat-lead" style="background:rgba(255,255,255,0.08);color:#94a3b8;border:1px solid rgba(255,255,255,0.15);">Lực lượng cân bằng</span>`;
      }

      html += `
        <div class="cm-material-bar">
          <div class="cm-mat-scores">
            <span>Bạn: <strong style="color:#ffffff;">${myScore}đ</strong></span>
            <span style="color:#64748b;font-weight:700;">VS</span>
            <span>Địch: <strong style="color:#ffffff;">${oppScore}đ</strong></span>
          </div>
          ${leadBadge}
        </div>
      `;
    }

    if (translation && this.lastBestMove) {
      const stratBoxHtml = strat ? `
        <div class="cm-strat-box" style="border-left: 3px solid ${strat.color};">
          <div class="cm-strat-head">
            <span class="cm-strat-title" style="color: ${strat.color};">${strat.badge}</span>
            <span class="cm-strat-tag">${strat.tag}</span>
          </div>
          <div class="cm-strat-advice">${strat.advice}</div>
        </div>
      ` : '';

      const efficiencyHtml = this.lastEfficiencyNote ? `
        <div style="display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:700;color:#38bdf8;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:2px;padding:4px 8px;margin-top:2px;">
          <span>${this.lastEfficiencyNote}</span>
        </div>
      ` : '';

      if (this.isMyTurn) {
        // CASE: OUR TURN
        const promoBoxHtml = translation.promotion ? `
          <div class="cm-promo-box">
            <div class="cm-promo-head">
              <span class="cm-promo-title">KHUYÊN DÙNG: PHONG ${translation.promoName?.toUpperCase() || 'HẬU'}</span>
              ${translation.promotion !== 'q' 
                ? '<span class="cm-promo-badge" style="background:rgba(239,68,68,0.2);color:#f87171;border-color:rgba(239,68,68,0.4);">UNDERPROMOTION</span>' 
                : '<span class="cm-promo-badge">TỐI ƯU HỎA LỰC +9</span>'}
            </div>
            <div class="cm-promo-desc">
              ${translation.desc}
            </div>
          </div>
        ` : '';

        html += `
          <div class="cm-card" style="border: 1px solid rgba(34, 197, 94, 0.45); box-shadow: 0 0 14px rgba(34,197,94,0.12);">
            <div class="cm-card-head">
              <span class="cm-tag" style="background:rgba(34,197,94,0.15);color:#22c55e;border-color:rgba(34,197,94,0.4);">
                LƯỢT CỦA BẠN (${myColorName})
              </span>
              <span class="cm-eval-chip" title="${evalParts.full}">${evalParts.numeric}</span>
            </div>
            <div class="cm-eval-subrow">
              <span class="cm-eval-dot"></span>
              <span>${evalParts.desc}</span>
            </div>

            <div class="cm-instruction" style="color:#22c55e;font-size:14px;font-weight:700;">
              ${translation.title}
            </div>
            <div class="cm-reason">
              <strong>Chiến thuật:</strong> ${translation.desc}
            </div>

            ${stratBoxHtml}
            ${efficiencyHtml}
            ${promoBoxHtml}

            <div class="cm-explain-box">
              <button class="cm-btn-explain" id="cm-btn-ai-explain">
                PHÂN TÍCH CHIẾN THUẬT SÂU
              </button>
              <div id="cm-ai-result-box" style="display:none;" class="cm-explain-result"></div>
            </div>
          </div>
        `;
      } else {
        // CASE: OPPONENT'S TURN
        html += `
          <div class="cm-card" style="border: 1px solid rgba(234, 179, 8, 0.3); background: rgba(20, 23, 29, 0.95);">
            <div class="cm-card-head">
              <span class="cm-tag" style="background:rgba(234,179,8,0.15);color:#eab308;border-color:rgba(234,179,8,0.4);">
                LƯỢT ĐỐI THỦ (${oppColorName})
              </span>
              <span class="cm-eval-chip" style="color:#eab308;background:rgba(234,179,8,0.12);border-color:rgba(234,179,8,0.3);" title="${evalParts.full}">${evalParts.numeric}</span>
            </div>
            <div class="cm-eval-subrow">
              <span class="cm-eval-dot" style="background:#eab308;"></span>
              <span>${evalParts.desc}</span>
            </div>

            <div class="cm-instruction" style="color:#eab308;font-size:13px;font-weight:600;">
              Đang đợi đối thủ (${oppColorName}) đi nước cờ...
            </div>
            <div class="cm-reason" style="font-size:11px;color:#9ca3af;line-height:1.5;">
              <strong>Dự đoán nước tốt nhất của đối thủ:</strong> ${translation.title}
              <br><span style="color:#6b7280;">Hệ thống sẽ gợi ý nước cờ chuẩn cho bạn ngay khi đối thủ đi xong.</span>
            </div>

            ${stratBoxHtml}
          </div>
        `;
      }
    } else {
      html += `
        <div class="cm-card" style="text-align: center; padding: 28px 12px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">ĐANG CHỜ LƯỢT ĐI</div>
          <div style="font-size: 11px; color: #808893; line-height: 1.45;">
            Hệ thống tự động phân tích và đưa ra tên quân cờ kèm ô di chuyển khi đến lượt bạn.
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

    // Hook side buttons
    body.querySelectorAll('.cm-side-btn').forEach(btn => {
      btn.onclick = () => {
        const side = btn.getAttribute('data-side');
        this.sideOverride = (side === 'auto') ? null : side;
        if (this.onReanalyze) this.onReanalyze();
        else this.renderBody();
      };
    });

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
            evaluation: this.lastEvaluation,
            userColor: this.sideOverride || this.userColor,
            provider: this.config.llmProvider || 'gemini',
            apiKey: this.config.llmApiKey,
            endpoint: this.config.llmEndpoint || '',
            model: this.config.llmModel || ''
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

    // Touch dragging & swipe support for mobile
    handle.ontouchstart = (e) => {
      if (e.target.closest('button')) return;
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      isDragging = true;
      startX = touch.clientX;
      startY = touch.clientY;

      const rect = this.root.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      const onTouchMove = (moveEvent) => {
        if (!isDragging || !moveEvent.touches || moveEvent.touches.length === 0) return;
        const moveTouch = moveEvent.touches[0];
        const dx = moveTouch.clientX - startX;
        const dy = moveTouch.clientY - startY;

        // If swiping down more than 60px from the handle, smoothly collapse into compact Mini Bar
        if (dy > 60 && Math.abs(dx) < 60) {
          isDragging = false;
          cleanupTouch();
          this.compact();
          return;
        }

        const maxLeft = window.innerWidth - this.root.offsetWidth - 8;
        const maxTop = window.innerHeight - this.root.offsetHeight - 8;

        const newLeft = Math.max(8, Math.min(maxLeft, initialLeft + dx));
        const newTop = Math.max(8, Math.min(maxTop, initialTop + dy));

        this.root.style.bottom = 'auto';
        this.root.style.right = 'auto';
        this.root.style.left = `${newLeft}px`;
        this.root.style.top = `${newTop}px`;
      };

      const cleanupTouch = () => {
        isDragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', cleanupTouch);
        document.removeEventListener('touchcancel', cleanupTouch);
      };

      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', cleanupTouch);
      document.addEventListener('touchcancel', cleanupTouch);
    };
  }
}
