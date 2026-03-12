import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { regionalCreativeProfiles } from '../../db/schema.js';
import type { CreateRegionalProfile } from '@brindin/shared';

export async function getProfile(regionCode: string) {
  const [profile] = await db
    .select()
    .from(regionalCreativeProfiles)
    .where(
      and(
        eq(regionalCreativeProfiles.regionCode, regionCode),
        eq(regionalCreativeProfiles.isActive, true),
      ),
    );

  return profile ?? null;
}

export async function getProfilesForRegions(regionCodes: string[]) {
  if (regionCodes.length === 0) return [];

  return db
    .select()
    .from(regionalCreativeProfiles)
    .where(
      and(
        inArray(regionalCreativeProfiles.regionCode, regionCodes),
        eq(regionalCreativeProfiles.isActive, true),
      ),
    );
}

export async function getAllActiveProfiles() {
  return db
    .select()
    .from(regionalCreativeProfiles)
    .where(eq(regionalCreativeProfiles.isActive, true));
}

export async function upsertProfile(input: CreateRegionalProfile) {
  const [profile] = await db
    .insert(regionalCreativeProfiles)
    .values({
      regionCode: input.regionCode,
      regionName: input.regionName,
      primaryLanguages: input.primaryLanguages,
      typographyStyle: input.typographyStyle,
      colorTendencies: input.colorTendencies,
      layoutDensity: input.layoutDensity,
      copyTone: input.copyTone,
      trustSignals: input.trustSignals,
      visualGrammar: input.visualGrammar,
      whatFails: input.whatFails ?? null,
      languageDevices: input.languageDevices ?? null,
      confidenceTier: input.confidenceTier,
      source: input.source,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: regionalCreativeProfiles.regionCode,
      set: {
        regionName: input.regionName,
        primaryLanguages: input.primaryLanguages,
        typographyStyle: input.typographyStyle,
        colorTendencies: input.colorTendencies,
        layoutDensity: input.layoutDensity,
        copyTone: input.copyTone,
        trustSignals: input.trustSignals,
        visualGrammar: input.visualGrammar,
        whatFails: input.whatFails ?? null,
        languageDevices: input.languageDevices ?? null,
        confidenceTier: input.confidenceTier,
        source: input.source,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning();

  return profile;
}

export async function deactivateProfile(regionCode: string) {
  await db
    .update(regionalCreativeProfiles)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(regionalCreativeProfiles.regionCode, regionCode));
}
