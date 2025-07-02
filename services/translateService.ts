import { API_CONFIG } from './api';

export async function translateText(text: string, targetLang: 'vi' | 'en'): Promise<string> {
  const res = await fetch(`${API_CONFIG.baseURL}/api/translate`, {
    method: 'POST',
    headers: API_CONFIG.headers,
    body: JSON.stringify({ text, target_lang: targetLang }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi dịch, thử lại!');
  }
  const data = await res.json();
  return data.translated;
} 