// Phase 2F — Gemini Provider Adapter

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../env.js';
import type {
  AIProviderAdapter,
  VisionRequest,
  VisionResponse,
  SynthesisRequest,
  SynthesisResponse,
} from '../types.js';

const GEMINI_MODEL = 'gemini-2.5-pro';

export class GeminiProvider implements AIProviderAdapter {
  readonly provider = 'gemini' as const;
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(env.GOOGLE_GENAI_API_KEY!);
    }
    return this.genAI;
  }

  isAvailable(): boolean {
    return !!env.GOOGLE_GENAI_API_KEY;
  }

  async analyzeVision(request: VisionRequest): Promise<VisionResponse> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // System prompt as text
    parts.push({ text: request.systemPrompt });

    for (let i = 0; i < request.images.length; i++) {
      parts.push({
        text: `Image ${i + 1} (creative: ${request.creativeIds[i]}):`,
      });
      parts.push({
        inlineData: {
          mimeType: request.images[i].mediaType,
          data: request.images[i].base64,
        },
      });
    }

    parts.push({
      text: `Analyze all ${request.images.length} images above. Return a JSON array with one analysis object per image.`,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: 4096 },
    });

    const response = result.response;
    const responseText = response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(`[gemini] Failed to parse vision response: ${responseText.slice(0, 200)}`);
    }

    const analyses: Record<string, unknown>[] = JSON.parse(jsonMatch[0]);
    const usage = response.usageMetadata;

    return {
      analyses,
      usage: {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      },
      model: GEMINI_MODEL,
      provider: 'gemini',
    };
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResponse> {
    const genAI = this.getClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: request.userMessage }] }],
      systemInstruction: { role: 'user', parts: [{ text: request.systemPrompt }] },
      generationConfig: { maxOutputTokens: request.maxOutputTokens ?? 5120 },
    });

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;
    const finishReason = response.candidates?.[0]?.finishReason;
    const truncated = finishReason === 'MAX_TOKENS';

    return {
      text,
      truncated,
      usage: {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      },
      model: GEMINI_MODEL,
      provider: 'gemini',
    };
  }
}
