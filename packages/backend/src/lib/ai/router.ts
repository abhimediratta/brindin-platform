// Phase 2F — AI Router with Task-Based Routing and Fallback Chains

import type {
  AIProvider,
  AIProviderAdapter,
  AITask,
  VisionRequest,
  VisionResponse,
  SynthesisRequest,
  SynthesisResponse,
  TranslationRequest,
  TranslationResponse,
  TransliterationRequest,
  TransliterationResponse,
} from './types.js';
import { ClaudeProvider } from './providers/claude.js';
import { GeminiProvider } from './providers/gemini.js';
import { SarvamProvider } from './providers/sarvam.js';

const ROUTES: Record<AITask, AIProvider[]> = {
  'vision-analysis': ['gemini', 'claude'],
  'design-system-synthesis': ['claude', 'gemini'],
  'translation': ['sarvam'],
  'transliteration': ['sarvam'],
};

export class AIRouter {
  private adapters = new Map<AIProvider, AIProviderAdapter>();

  constructor() {
    const providers: AIProviderAdapter[] = [
      new ClaudeProvider(),
      new GeminiProvider(),
      new SarvamProvider(),
    ];

    for (const provider of providers) {
      if (provider.isAvailable()) {
        this.adapters.set(provider.provider, provider);
        console.log(`[ai-router] Registered provider: ${provider.provider}`);
      } else {
        console.log(`[ai-router] Provider ${provider.provider} not available (no API key)`);
      }
    }
  }

  async analyzeVision(request: VisionRequest): Promise<VisionResponse> {
    return this.executeWithFallback('vision-analysis', (adapter) => {
      if (!adapter.analyzeVision) {
        throw new Error(`Provider ${adapter.provider} does not support vision analysis`);
      }
      return adapter.analyzeVision(request);
    });
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResponse> {
    return this.executeWithFallback('design-system-synthesis', (adapter) => {
      if (!adapter.synthesize) {
        throw new Error(`Provider ${adapter.provider} does not support synthesis`);
      }
      return adapter.synthesize(request);
    });
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    return this.executeWithFallback('translation', (adapter) => {
      if (!adapter.translate) {
        throw new Error(`Provider ${adapter.provider} does not support translation`);
      }
      return adapter.translate(request);
    });
  }

  async transliterate(request: TransliterationRequest): Promise<TransliterationResponse> {
    return this.executeWithFallback('transliteration', (adapter) => {
      if (!adapter.transliterate) {
        throw new Error(`Provider ${adapter.provider} does not support transliteration`);
      }
      return adapter.transliterate(request);
    });
  }

  isTaskAvailable(task: AITask): boolean {
    const route = ROUTES[task];
    return route.some((provider) => this.adapters.has(provider));
  }

  private async executeWithFallback<T>(
    task: AITask,
    execute: (adapter: AIProviderAdapter) => Promise<T>,
  ): Promise<T> {
    const route = ROUTES[task];
    const errors: Error[] = [];

    for (const providerName of route) {
      const adapter = this.adapters.get(providerName);
      if (!adapter) continue;

      try {
        console.log(`[ai-router] ${task}: trying ${providerName}`);
        const result = await execute(adapter);
        console.log(`[ai-router] ${task}: success with ${providerName}`);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn(`[ai-router] ${task}: ${providerName} failed — ${err.message}`);
        errors.push(err);
      }
    }

    throw new AggregateError(
      errors,
      `[ai-router] All providers failed for task "${task}": ${errors.map((e) => e.message).join('; ')}`,
    );
  }
}

let routerInstance: AIRouter | null = null;

export function getAIRouter(): AIRouter {
  if (!routerInstance) {
    routerInstance = new AIRouter();
  }
  return routerInstance;
}
