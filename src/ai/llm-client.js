import { explanationPrompt } from './prompts.js';
import { calculateMaterial, evaluateMoveStrategy } from '../utils/board-evaluator.js';

const cache = new Map();

export function clearLlmCache() {
  cache.clear();
}

export async function explainMove({ fen, move, evaluation = 0, userColor = 'w', provider = 'gemini', apiKey }) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Chưa cung cấp API Key. Hãy cấu hình trong menu tiện ích.');
  }

  const cacheKey = `${provider}:${fen}:${move}`;
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

  if (provider === 'gemini') {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: promptText }]
            }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error?.message || `HTTP ${res.status}`;
          lastError = new Error(`Lỗi Google Gemini (${model}): ${msg}`);
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

  // Provider: OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: promptText
      }],
      max_tokens: 220
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Lỗi OpenAI: ${msg}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Không nhận được nội dung phân tích từ OpenAI.');

  cache.set(cacheKey, text);
  return text;
}
