// Phase 2F — Regional Variant Service

import { eq, and } from 'drizzle-orm';

import { db } from '../../db/index.js';
import { regionalVariants, designSystems } from '../../db/schema.js';
import { translationQueue } from '../../lib/queue.js';
import { getAIRouter } from '../../lib/ai/index.js';
import type { TranslationJobData } from '../../workers/translation.js';

export async function createRegionalVariant(input: {
  designSystemId: string;
  regionCode: string;
  language: string;
  orgId: string;
  brandId: string;
}): Promise<{ variantId: string; translationJobQueued: boolean }> {
  const { designSystemId, regionCode, language, orgId, brandId } = input;

  // Fetch design system to extract translatable copy fields
  const [designSystem] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.id, designSystemId));

  if (!designSystem) {
    throw new Error(`Design system ${designSystemId} not found`);
  }

  // Transliterate brand name if Sarvam is available
  const router = getAIRouter();
  const culturalNotes: Record<string, unknown> = {};

  if (router.isTaskAvailable('transliteration')) {
    try {
      const result = await router.transliterate({
        text: designSystem.brandId ?? '',
        sourceScript: 'latin',
        targetScript: mapLanguageToScript(language),
      });
      culturalNotes.transliteratedBrandName = result.transliteratedText;
    } catch {
      // Non-critical — skip transliteration
    }
  }

  // Insert regional variant row
  const [variant] = await db
    .insert(regionalVariants)
    .values({
      designSystemId,
      regionCode,
      language,
      culturalNotes,
    })
    .returning({ id: regionalVariants.id });

  // Extract translatable fields from the design system
  const fields = extractTranslatableFields(designSystem);

  let translationJobQueued = false;

  if (fields.length > 0 && router.isTaskAvailable('translation')) {
    const jobData: TranslationJobData = {
      designSystemId,
      variantId: variant.id,
      regionCode,
      language,
      fields,
      orgId,
      brandId,
    };

    await translationQueue.add('translate-variant', jobData);
    translationJobQueued = true;
  }

  return { variantId: variant.id, translationJobQueued };
}

export async function getRegionalVariants(designSystemId: string) {
  return db
    .select()
    .from(regionalVariants)
    .where(eq(regionalVariants.designSystemId, designSystemId));
}

function extractTranslatableFields(designSystem: typeof designSystems.$inferSelect): { key: string; text: string }[] {
  const fields: { key: string; text: string }[] = [];

  // Extract copy patterns
  const copyPatterns = designSystem.copyPatterns as Record<string, unknown> | null;
  if (copyPatterns) {
    if (typeof copyPatterns.tone === 'string') {
      fields.push({ key: 'copyPatterns.tone', text: copyPatterns.tone });
    }
    const ctaConventions = copyPatterns.ctaConventions;
    if (Array.isArray(ctaConventions)) {
      for (let i = 0; i < ctaConventions.length; i++) {
        if (typeof ctaConventions[i] === 'string') {
          fields.push({ key: `copyPatterns.ctaConventions[${i}]`, text: ctaConventions[i] });
        }
      }
    }
  }

  // Extract onboarding guide text
  const onboarding = designSystem.onboardingGuide;
  if (typeof onboarding === 'string') {
    fields.push({ key: 'onboardingGuide', text: onboarding });
  }

  // Extract color palette guidelines
  const colorPalette = designSystem.colorPalette as Record<string, unknown> | null;
  if (colorPalette && typeof colorPalette.guidelines === 'string') {
    fields.push({ key: 'colorPalette.guidelines', text: colorPalette.guidelines });
  }

  // Extract typography guidelines
  const typography = designSystem.typography as Record<string, unknown> | null;
  if (typography && typeof typography.guidelines === 'string') {
    fields.push({ key: 'typography.guidelines', text: typography.guidelines });
  }

  return fields;
}

function mapLanguageToScript(language: string): string {
  const scriptMap: Record<string, string> = {
    hindi: 'devanagari',
    marathi: 'devanagari',
    tamil: 'tamil',
    telugu: 'telugu',
    kannada: 'kannada',
    malayalam: 'malayalam',
    bengali: 'bengali',
    gujarati: 'gujarati',
    punjabi: 'gurmukhi',
    odia: 'odia',
  };
  return scriptMap[language.toLowerCase()] ?? 'devanagari';
}
