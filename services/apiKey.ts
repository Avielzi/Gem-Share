import { API_KEY_STORAGE_KEY } from '../constants.ts';

// Where the Gemini key comes from, in order:
//  1. A key the person saved in this browser (Settings > API). It stays in
//     their localStorage and goes only to Google.
//  2. A key the hosting page provides at runtime. Google AI Studio does this
//     for its hosted preview; it is never part of the built files.
//
// It is never baked into the bundle: vite.config.ts no longer injects
// GEMINI_API_KEY, and a build that contains a Google API key fails.

export function getApiKey(): string | undefined {
  try {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY)?.trim();
    if (saved) return saved;
  } catch { /* storage blocked: fall through */ }
  try {
    // Literal on purpose: the AI Studio host substitutes this expression.
    // In a normal build `process` does not exist and this throws.
    const hosted = process.env.API_KEY;
    if (typeof hosted === 'string' && hosted.trim()) return hosted.trim();
  } catch { /* not provided by the host */ }
  return undefined;
}

export function saveApiKey(key: string): void {
  const k = key.trim();
  try {
    if (k) localStorage.setItem(API_KEY_STORAGE_KEY, k);
    else localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch { /* storage blocked */ }
}

export function hasSavedApiKey(): boolean {
  try { return !!localStorage.getItem(API_KEY_STORAGE_KEY)?.trim(); } catch { return false; }
}

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Gemini API key. Add your own key in Settings > API.');
    this.name = 'MissingApiKeyError';
  }
}
