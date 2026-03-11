// Phase 2F — Multi-Provider AI Layer: Type Definitions

export type AIProvider = 'claude' | 'gemini' | 'sarvam';

export type AITask = 'vision-analysis' | 'design-system-synthesis' | 'translation' | 'transliteration';

export interface VisionRequest {
  images: { base64: string; mediaType: string }[];
  creativeIds: string[];
  systemPrompt: string;
}

export interface VisionResponse {
  analyses: Record<string, unknown>[];
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  provider: AIProvider;
}

export interface SynthesisRequest {
  systemPrompt: string;
  userMessage: string;
  maxOutputTokens?: number;
}

export interface SynthesisResponse {
  text: string;
  truncated: boolean;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  provider: AIProvider;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  translatedText: string;
  provider: AIProvider;
  model: string;
  costMicrodollars: number;
}

export interface TransliterationRequest {
  text: string;
  sourceScript: string;
  targetScript: string;
}

export interface TransliterationResponse {
  transliteratedText: string;
  provider: AIProvider;
  model: string;
}

export interface AIProviderAdapter {
  readonly provider: AIProvider;
  analyzeVision?(request: VisionRequest): Promise<VisionResponse>;
  synthesize?(request: SynthesisRequest): Promise<SynthesisResponse>;
  translate?(request: TranslationRequest): Promise<TranslationResponse>;
  transliterate?(request: TransliterationRequest): Promise<TransliterationResponse>;
  isAvailable(): boolean;
}
