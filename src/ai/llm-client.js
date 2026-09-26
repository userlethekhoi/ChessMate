import { explanationPrompt } from './prompts.js';
import { calculateMaterial, evaluateMoveStrategy } from '../utils/board-evaluator.js';

const cache = new Map();

export function clearLlmCache() {
  cache.clear();
}

/**
 * Cấu hình mặc định cho các nhà cung cấp phổ biến
 */
export const PROVIDER_PRESETS = {
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    hint: 'Lấy khóa API miễn phí tại aistudio.google.com'
  },
  openai: {
    name: 'OpenAI (ChatGPT)',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    hint: 'Khóa bắt đầu bằng sk-...'
  },
  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    hint: 'API siêu rẻ, thông minh, khóa sk-...'
  },
  openrouter: {
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    hint: 'Dùng được Claude, Llama, Mistral qua 1 key duy nhất'
  },
  groq: {
    name: 'Groq Cloud',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    hint: 'Tốc độ phản hồi siêu nhanh dưới 0.3 giây'
  },
  custom: {
    name: 'Tùy Chỉnh (Bất kỳ AI nào)',
    endpoint: '',
    defaultModel: '',
    hint: 'Tự nhập Endpoint URL và Model ID tùy ý (Ollama, Together, v.v.)'
  }
};

/**
 * Gọi API phân tích thế cờ hỗ trợ mọi nhà cung cấp AI hoặc Custom Endpoint
 */
export async function explainMove({
  fen,
  move,
  evaluation = 0,
  userColor = 'w',
  provider = 'gemini',
  apiKey = '',
  endpoint = '',
  model = ''
}) {
  const cleanKey = String(apiKey || '').trim();

  // Local Ollama might not require an API key
  const isCustomLocal = provider === 'custom' && (endpoint.includes('localhost') || endpoint.includes('127.0.0.1'));
  if (!cleanKey && !isCustomLocal) {
    throw new Error('Chưa cung cấp API Key. Hãy cấu hình trong menu tiện ích.');
  }

  const cacheKey = `${provider}:${model}:${fen}:${move}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Phân tích ngữ cảnh lực lượng và chiến lược đổi/thí/thủ
  const mat = calculateMaterial(fen);
  const strat = evaluateMoveStrategy({ fen, uci: move, evaluation, userColor });

  const materialInfo = mat
    ? `Trắng: ${mat.whiteScore}đ | Đen: ${mat.blackScore}đ (${mat.diffText})`
    : 'Chưa xác định';
  const strategyInfo = strat
    ? `[${strat.badge}] - ${strat.advice}`
    : 'Tối ưu nước cờ';

  const promptText = explanationPrompt({ fen, move, materialInfo, strategyInfo });

  // 1. Google Gemini Native API
  if (provider === 'gemini') {
    const targetModel = model.trim() || 'gemini-2.0-flash';
    const fallbackModels = [targetModel, 'gemini-1.5-flash', 'gemini-2.0-flash'];
    let lastError = null;

    for (const m of [...new Set(fallbackModels)]) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error?.message || `HTTP ${res.status}`;
          lastError = new Error(`Lỗi Google Gemini (${m}): ${msg}`);
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            throw lastError;
          }
          continue;
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          cache.set(cacheKey, text);
          return text;
        }
      } catch (err) {
        lastError = err;
        if (err.message?.includes('API key') || err.message?.includes('Khóa API')) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Không thể kết nối đến mô hình Google Gemini.');
  }

  // 2. OpenAI / DeepSeek / OpenRouter / Groq / Custom OpenAI-Compatible
  let targetUrl = endpoint.trim();
  let targetModel = model.trim();

  if (provider === 'openai') {
    targetUrl = targetUrl || 'https://api.openai.com/v1/chat/completions';
    targetModel = targetModel || 'gpt-4o-mini';
  } else if (provider === 'deepseek') {
    targetUrl = targetUrl || 'https://api.deepseek.com/chat/completions';
    targetModel = targetModel || 'deepseek-chat';
  } else if (provider === 'openrouter') {
    targetUrl = targetUrl || 'https://openrouter.ai/api/v1/chat/completions';
    targetModel = targetModel || 'google/gemini-2.0-flash-exp:free';
  } else if (provider === 'groq') {
    targetUrl = targetUrl || 'https://api.groq.com/openai/v1/chat/completions';
    targetModel = targetModel || 'llama-3.3-70b-versatile';
  } else if (provider === 'custom') {
    if (!targetUrl) {
      throw new Error('Vui lòng nhập Endpoint URL cho AI tùy chỉnh (Ví dụ: https://api.deepseek.com/chat/completions)');
    }
    // Tự động chuẩn hóa endpoint nếu người dùng chỉ nhập base URL dạng /v1
    if (!targetUrl.includes('/chat/completions') && !targetUrl.includes('/generateContent')) {
      targetUrl = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    }
    targetModel = targetModel || 'default';
  }

  const headers = {
    'Content-Type': 'application/json'
  };
  if (cleanKey) {
    headers['Authorization'] = `Bearer ${cleanKey}`;
  }
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://chess.com';
    headers['X-Title'] = 'ChessMate AI Agent';
  }

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: targetModel,
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 250
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || `HTTP ${res.status}`;
    throw new Error(`Lỗi [${provider.toUpperCase()}]: ${msg}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content || json.message?.content || json.response;
  if (!text) throw new Error(`Không nhận được phản hồi phân tích từ ${provider}.`);

  cache.set(cacheKey, text);
  return text;
}
