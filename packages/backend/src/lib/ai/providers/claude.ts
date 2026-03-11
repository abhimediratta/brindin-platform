// Phase 2F — Claude Provider Adapter

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../env.js';
import type {
  AIProviderAdapter,
  VisionRequest,
  VisionResponse,
  SynthesisRequest,
  SynthesisResponse,
} from '../types.js';

const VISION_MODEL = 'claude-haiku-4-5-20241022';
const SYNTHESIS_MODEL = 'claude-sonnet-4-6-20250514';

export class ClaudeProvider implements AIProviderAdapter {
  readonly provider = 'claude' as const;
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }
    return this.client;
  }

  isAvailable(): boolean {
    return !!env.ANTHROPIC_API_KEY;
  }

  async analyzeVision(request: VisionRequest): Promise<VisionResponse> {
    const client = this.getClient();

    const imageBlocks: Anthropic.Messages.ContentBlockParam[] = [];
    for (let i = 0; i < request.images.length; i++) {
      imageBlocks.push({
        type: 'text',
        text: `Image ${i + 1} (creative: ${request.creativeIds[i]}):`,
      });
      imageBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: request.images[i].mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: request.images[i].base64,
        },
      });
    }

    imageBlocks.push({
      type: 'text',
      text: `Analyze all ${request.images.length} images above. Return a JSON array with one analysis object per image.`,
    });

    const response = await client.messages.create({
      model: VISION_MODEL,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: request.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: imageBlocks }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const responseText = textBlock?.type === 'text' ? textBlock.text : '';

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(`[claude] Failed to parse vision response: ${responseText.slice(0, 200)}`);
    }

    const analyses: Record<string, unknown>[] = JSON.parse(jsonMatch[0]);

    return {
      analyses,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: VISION_MODEL,
      provider: 'claude',
    };
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResponse> {
    const client = this.getClient();

    const response = await client.messages.create({
      model: SYNTHESIS_MODEL,
      max_tokens: request.maxOutputTokens ?? 5120,
      system: [
        {
          type: 'text',
          text: request.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: request.userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';
    const truncated = response.stop_reason === 'max_tokens';

    return {
      text,
      truncated,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: SYNTHESIS_MODEL,
      provider: 'claude',
    };
  }
}
