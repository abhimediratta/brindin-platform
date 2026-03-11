// Phase 2F — Sarvam AI Provider Adapter

import { env } from '../../env.js';
import type {
  AIProviderAdapter,
  TranslationRequest,
  TranslationResponse,
  TransliterationRequest,
  TransliterationResponse,
} from '../types.js';

const SARVAM_BASE_URL = 'https://api.sarvam.ai';

export class SarvamProvider implements AIProviderAdapter {
  readonly provider = 'sarvam' as const;

  isAvailable(): boolean {
    return !!env.SARVAM_API_KEY;
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${SARVAM_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': env.SARVAM_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[sarvam] ${path} failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const result = await this.request<{ translated_text: string }>('/translate', {
      input: request.text,
      source_language_code: request.sourceLanguage,
      target_language_code: request.targetLanguage,
      mode: 'formal',
      ...(request.context ? { context: request.context } : {}),
    });

    return {
      translatedText: result.translated_text,
      provider: 'sarvam',
      model: 'sarvam-translate',
      costMicrodollars: 0, // Sarvam uses per-request pricing tracked separately
    };
  }

  async transliterate(request: TransliterationRequest): Promise<TransliterationResponse> {
    const result = await this.request<{ transliterated_text: string }>('/transliterate', {
      input: request.text,
      source_script: request.sourceScript,
      target_script: request.targetScript,
    });

    return {
      transliteratedText: result.transliterated_text,
      provider: 'sarvam',
      model: 'sarvam-transliterate',
    };
  }
}
