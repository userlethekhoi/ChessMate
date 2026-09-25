import { getConfig, setConfig } from '../storage/config-manager.js';
import { getModeConfig } from '../engine/thinking-modes.js';

const $ = id => document.getElementById(id);

async function notifyActiveTab(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    }
  } catch (_) {}
}

function setStatus(elementId, text, isError = false) {
  const el = $(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = 'diag-text';
  if (isError) el.classList.add('err');
}

function appendDiagLine(text, type = 'normal') {
  const consoleEl = $('diagConsole');
  if (!consoleEl) return;
  const line = document.createElement('div');
  line.className = `diag-line ${type}`;
  line.textContent = text;
  consoleEl.append(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearDiagConsole() {
  const consoleEl = $('diagConsole');
  if (consoleEl) consoleEl.innerHTML = '';
}

async function verifyApiKey(provider, apiKey) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Vui lòng nhập khóa API Key trước khi kiểm tra.');
  }

  if (provider === 'gemini') {
    // 1. Kiểm tra xác thực khóa thông qua endpoint danh sách models của Google AI Studio
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const rawMsg = errData?.error?.message || `Mã HTTP ${res.status}`;
      if (rawMsg.toLowerCase().includes('api key not valid') || rawMsg.toLowerCase().includes('api_key_invalid')) {
        throw new Error('Khóa API không hợp lệ hoặc đã bị vô hiệu hóa. Hãy lấy key mới tại aistudio.google.com');
      }
      if (rawMsg.toLowerCase().includes('expired')) {
        throw new Error('Khóa API đã hết hạn sử dụng. Hãy tạo key mới tại aistudio.google.com');
      }
      throw new Error(`Google từ chối xác thực: ${rawMsg}`);
    }

    const data = await res.json().catch(() => ({}));
    if (Array.isArray(data.models)) {
      return `Hợp lệ (Đã kết nối Google Gemini với ${data.models.length} mô hình khả dụng)`;
    }
    return 'Hợp lệ và sẵn sàng hoạt động';
  }

  // OpenAI verification
  const res = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const rawMsg = errData?.error?.message || `Mã HTTP ${res.status}`;
    if (res.status === 401) {
      throw new Error('Khóa API OpenAI không chính xác hoặc đã hết hạn.');
    }
    throw new Error(`OpenAI từ chối xác thực: ${rawMsg}`);
  }

  return 'Hợp lệ và sẵn sàng hoạt động';
}

async function runTestAll() {
  const testBtn = $('testAllBtn');
  testBtn.disabled = true;
  testBtn.textContent = 'ĐANG TIẾN HÀNH KIỂM TRA...';
  clearDiagConsole();

  appendDiagLine('[KHỞI ĐỘNG] Bắt đầu kiểm tra toàn bộ hệ thống...', 'run');

  // 1. Kiểm tra Stockfish WebAssembly Worker
  try {
    appendDiagLine('[1/4] Kiểm tra động cơ Stockfish 19 WebAssembly...', 'run');
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        worker?.terminate();
        reject(new Error('Hết thời gian phản hồi (Quá 2500ms)'));
      }, 2500);

      const url = globalThis.chrome?.runtime?.getURL?.('src/engine/stockfish.js') || new URL('../engine/stockfish.js', import.meta.url).href;
      const worker = new Worker(url);
      worker.postMessage('uci');

      worker.onmessage = e => {
        const text = typeof e.data === 'string' ? e.data : '';
        if (text.includes('Stockfish') || text.includes('uciok')) {
          clearTimeout(timer);
          worker.terminate();
          resolve('OK');
        }
      };

      worker.onerror = err => {
        clearTimeout(timer);
        worker.terminate();
        reject(new Error(err?.message || 'Không thể tạo Web Worker'));
      };
    });

    appendDiagLine('[1/4] ĐỘNG CƠ STOCKFISH: HOẠT ĐỘNG HOÀN HẢO [OK]', 'ok');
  } catch (err) {
    appendDiagLine(`[1/4] ĐỘNG CƠ STOCKFISH: THẤT BẠI (${err.message})`, 'err');
  }

  // 2. Kiểm tra Service Worker & Offscreen Document
  try {
    appendDiagLine('[2/4] Kiểm tra Service Worker & Offscreen Document...', 'run');
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Không nhận được phản hồi từ Service Worker')), 2500);
      chrome.runtime.sendMessage({ type: 'ENSURE_ENGINE' }, response => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        if (response?.success) {
          resolve('OK');
        } else {
          reject(new Error(response?.error || 'Lỗi định tuyến ngầm'));
        }
      });
    });

    appendDiagLine('[2/4] SERVICE WORKER & TIẾN TRÌNH NGẦM: ĐÃ SẴN SÀNG [OK]', 'ok');
  } catch (err) {
    appendDiagLine(`[2/4] SERVICE WORKER: THẤT BẠI (${err.message})`, 'err');
  }

  // 3. Kiểm tra Tab Chess.com đang mở
  try {
    appendDiagLine('[3/4] Kiểm tra trang cờ Chess.com đang hoạt động...', 'run');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      appendDiagLine('[3/4] TRANG CHESS.COM: CHƯA TÌM THẤY TAB HOẠT ĐỘNG', 'muted');
    } else if (!tab.url?.includes('chess.com')) {
      appendDiagLine('[3/4] TRANG CHESS.COM: CHƯA MỞ TRANG CỜ (Sẽ tự động kích hoạt khi vào ván)', 'muted');
    } else {
      const tabPing = await new Promise(resolve => {
        const timer = setTimeout(() => resolve(false), 1200);
        chrome.tabs.sendMessage(tab.id, { type: 'reanalyze' }, () => {
          clearTimeout(timer);
          resolve(true);
        });
      });
      if (tabPing) {
        appendDiagLine('[3/4] TRANG CHESS.COM: CONTENT SCRIPT ĐÃ KẾT NỐI [OK]', 'ok');
      } else {
        appendDiagLine('[3/4] TRANG CHESS.COM: ĐÃ MỞ TRANG (Sẵn sàng quét bàn cờ)', 'ok');
      }
    }
  } catch (err) {
    appendDiagLine(`[3/4] TRANG CHESS.COM: CHƯA PHẢN HỒI (${err.message})`, 'muted');
  }

  // 4. Kiểm tra khóa API (Nếu có cấu hình)
  const config = await getConfig();
  const apiKey = config.llmApiKey?.trim();
  const provider = config.llmProvider || 'gemini';

  if (!apiKey) {
    appendDiagLine('[4/4] CẤU HÌNH API: CHƯA THIẾT LẬP (Không bắt buộc, Engine tính nước vẫn chạy 100%)', 'muted');
  } else {
    try {
      appendDiagLine(`[4/4] Kiểm tra khóa API ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}...`, 'run');
      const verifyMsg = await verifyApiKey(provider, apiKey);
      appendDiagLine(`[4/4] KẾT NỐI API: ${verifyMsg.toUpperCase()} [OK]`, 'ok');
    } catch (err) {
      appendDiagLine(`[4/4] KẾT NỐI API: THẤT BẠI - ${err.message}`, 'err');
    }
  }

  appendDiagLine('[KẾT QUẢ] HOÀN TẤT CHẨN ĐOÁN. HỆ THỐNG SẴN SÀNG THI ĐẤU.', 'ok');
  testBtn.disabled = false;
  testBtn.textContent = 'CHẠY KIỂM TRA TOÀN BỘ (TEST ALL)';
}

async function init() {
  const config = await getConfig();

  // Điền dữ liệu cấu hình
  $('enabled').checked = Boolean(config.enabled);
  $('thinkingMode').value = config.thinkingMode || 'mate_hunt';
  $('thinkingModeDesc').textContent = getModeConfig(config.thinkingMode || 'mate_hunt').description;

  const modeRadio = document.querySelector(`input[name=mode][value=${config.autoPlay ? 'auto' : 'suggest'}]`);
  if (modeRadio) modeRadio.checked = true;

  $('depth').value = config.depth ?? 16;
  $('depthOut').value = config.depth ?? 16;
  $('skillLevel').value = config.skillLevel ?? 20;
  $('skillOut').value = config.skillLevel ?? 20;

  $('showHud').checked = config.showHud !== false;
  $('showArrows').checked = config.showArrows !== false;

  $('llmProvider').value = config.llmProvider || 'gemini';
  $('llmApiKey').value = config.llmApiKey || '';

  // Lắng nghe thanh trượt
  $('depth').oninput = e => $('depthOut').value = e.target.value;
  $('skillLevel').oninput = e => $('skillOut').value = e.target.value;

  // Lắng nghe thay đổi chế độ tư duy
  $('thinkingMode').onchange = e => {
    const mode = getModeConfig(e.target.value);
    $('thinkingModeDesc').textContent = mode.description;
  };

  // Công tắc Bật/Tắt Trợ thủ
  $('enabled').onchange = async () => {
    const isEnabled = $('enabled').checked;
    await setConfig({ enabled: isEnabled });
    setStatus('gameStatus', isEnabled ? '[TRẠNG THÁI] ĐÃ BẬT TRỢ THỦ' : '[TRẠNG THÁI] ĐÃ TẮT TRỢ THỦ');
    notifyActiveTab({ type: 'reanalyze' });
  };

  // Nút Ẩn/Hiện khóa API
  let isPasswordHidden = true;
  $('toggleApiKeyVis').onclick = () => {
    isPasswordHidden = !isPasswordHidden;
    $('llmApiKey').type = isPasswordHidden ? 'password' : 'text';
    $('toggleApiKeyVis').textContent = isPasswordHidden ? 'XEM' : 'ẨN';
  };

  // 1. Nút "Lưu Cấu Hình Game"
  $('saveGameConfig').onclick = async () => {
    const isAuto = document.querySelector('input[name=mode]:checked')?.value === 'auto';
    const updated = {
      thinkingMode: $('thinkingMode').value,
      autoPlay: isAuto,
      depth: parseInt($('depth').value, 10),
      skillLevel: parseInt($('skillLevel').value, 10),
      showHud: $('showHud').checked,
      showArrows: $('showArrows').checked
    };
    await setConfig(updated);
    setStatus('gameStatus', '[THÀNH CÔNG] ĐÃ ÁP DỤNG CẤU HÌNH VÁN CỜ');
    notifyActiveTab({ type: 'reanalyze' });
    setTimeout(() => setStatus('gameStatus', ''), 2500);
  };

  // 2. Nút "Mở Cửa Sổ HUD"
  $('reopenHud').onclick = async () => {
    await setConfig({ showHud: true });
    $('showHud').checked = true;
    notifyActiveTab({ type: 'show_hud' });
    setStatus('gameStatus', '[CỬA SỔ HUD] ĐÃ KÍCH HOẠT TRÊN BÀN CỜ');
    setTimeout(() => setStatus('gameStatus', ''), 2500);
  };

  // 3. Nút "Chạy Kiểm Tra Toàn Bộ (Test All)"
  $('testAllBtn').onclick = () => runTestAll();

  // 4. Nút "Lưu API Key"
  $('saveApiKeyBtn').onclick = async () => {
    const provider = $('llmProvider').value;
    const apiKey = $('llmApiKey').value.trim();

    await setConfig({
      llmProvider: provider,
      llmApiKey: apiKey
    });

    setStatus('apiKeyStatus', '[LƯU THÀNH CÔNG] ĐÃ LƯU KHÓA API VÀO TRÌNH DUYỆT');
    setTimeout(() => setStatus('apiKeyStatus', ''), 2500);
  };

  // 5. Nút "Kiểm Tra API"
  $('testApiKeyBtn').onclick = async () => {
    const provider = $('llmProvider').value;
    const apiKey = $('llmApiKey').value.trim();

    if (!apiKey) {
      setStatus('apiKeyStatus', '[CẢNH BÁO] Vui lòng nhập khóa API Key trước khi kiểm tra.', true);
      return;
    }

    setStatus('apiKeyStatus', `[KIỂM TRA] Đang kết nối tới ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}...`);

    try {
      const resultMessage = await verifyApiKey(provider, apiKey);
      setStatus('apiKeyStatus', `[THÀNH CÔNG] Khóa API ${provider.toUpperCase()}: ${resultMessage}`);
    } catch (err) {
      setStatus('apiKeyStatus', `[THẤT BẠI] ${err.message}`, true);
    }
  };
}

init();
