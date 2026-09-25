import { explanationPrompt } from './prompts.js';

const cache = new Map();

export async function explainMove({ fen, move, provider = 'gemini', apiKey }) {
  const cleanKey = String(apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Chưa cung cấp API Key. Hãy cấu hình trong menu tiện ích.');
  }

  const cacheKey = `${provider}:${fen}:${move}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

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
              parts: [{ text: `Bạn là kiện tướng cờ vua. Hãy giải thích ngắn gọn bằng 2-3 câu tiếng Việt dễ hiểu vì sao nước cờ ${move} là tối ưu trong thế cờ này (FEN: ${fen}). Chỉ rõ lợi ích chiến thuật.` }]
            }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error?.message || `HTTP ${res.status}`;
          lastError = new Error(`Lỗi Google Gemini (${model}): ${msg}`);
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            // Key invalid or unauthorized - stop retrying other models
            throw lastError;
          }
          continue; // Try next model if 404
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
        content: `Bạn là kiện tướng cờ vua. Hãy giải thích ngắn gọn bằng 2-3 câu tiếng Việt dễ hiểu vì sao nước cờ ${move} là tối ưu trong thế cờ này (FEN: ${fen}). Chỉ rõ lợi ích chiến thuật.`
      }],
      max_tokens: 150
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
