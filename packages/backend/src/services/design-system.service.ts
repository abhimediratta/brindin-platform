// Phase 3G — Design System Service
// CRUD operations for design system editing, versioning, and variant management

import { eq, and, desc, max } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import {
  designSystems,
  designSystemVersions,
  regionalVariants,
} from '../db/schema.js';

// ─── Valid Status Transitions ────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['review'],
  review: ['approved'],
  approved: ['draft'],
};

// ─── Design System Updates ───────────────────────────────────────────

export async function updateDesignSystem(
  brandId: string,
  orgId: string,
  updates: Partial<{
    colorPalette: unknown;
    typography: unknown;
    layoutStructures: unknown;
    imageTreatment: unknown;
    copyPatterns: unknown;
    logoUsage: unknown;
  }>,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  const [updated] = await db
    .update(designSystems)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(designSystems.id, existing.id))
    .returning();

  return updated;
}

// ─── Status Transitions ─────────────────────────────────────────────

export async function updateDesignSystemStatus(
  brandId: string,
  orgId: string,
  status: string,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  const currentStatus = existing.status ?? 'draft';
  const allowed = VALID_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(status)) {
    throw new HTTPException(400, {
      message: `Invalid status transition: ${currentStatus} → ${status}. Allowed: ${(allowed ?? []).join(', ')}`,
    });
  }

  const [updated] = await db
    .update(designSystems)
    .set({ status, updatedAt: new Date() })
    .where(eq(designSystems.id, existing.id))
    .returning();

  return updated;
}

// ─── Versioning ──────────────────────────────────────────────────────

export async function createVersion(
  brandId: string,
  orgId: string,
  changeSummary?: string,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  // Find max version number for this design system
  const [maxResult] = await db
    .select({ maxVersion: max(designSystemVersions.version) })
    .from(designSystemVersions)
    .where(eq(designSystemVersions.designSystemId, existing.id));

  const nextVersion = (maxResult?.maxVersion ?? 0) + 1;

  // Snapshot current state
  const snapshot = {
    colorPalette: existing.colorPalette,
    typography: existing.typography,
    layoutStructures: existing.layoutStructures,
    imageTreatment: existing.imageTreatment,
    copyPatterns: existing.copyPatterns,
    logoUsage: existing.logoUsage,
    confidenceScores: existing.confidenceScores,
  };

  const [version] = await db
    .insert(designSystemVersions)
    .values({
      designSystemId: existing.id,
      version: nextVersion,
      snapshot,
      changeSummary: changeSummary ?? null,
    })
    .returning();

  return version;
}

export async function listVersions(brandId: string, orgId: string) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  return db
    .select()
    .from(designSystemVersions)
    .where(eq(designSystemVersions.designSystemId, existing.id))
    .orderBy(desc(designSystemVersions.version));
}

export async function getVersion(
  brandId: string,
  orgId: string,
  versionId: string,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  const [version] = await db
    .select()
    .from(designSystemVersions)
    .where(
      and(
        eq(designSystemVersions.id, versionId),
        eq(designSystemVersions.designSystemId, existing.id),
      ),
    );

  if (!version) {
    throw new HTTPException(404, { message: 'Version not found' });
  }

  return version;
}

export async function restoreVersion(
  brandId: string,
  orgId: string,
  versionId: string,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  // Fetch the version to restore
  const [targetVersion] = await db
    .select()
    .from(designSystemVersions)
    .where(
      and(
        eq(designSystemVersions.id, versionId),
        eq(designSystemVersions.designSystemId, existing.id),
      ),
    );

  if (!targetVersion) {
    throw new HTTPException(404, { message: 'Version not found' });
  }

  // Auto-create a snapshot of current state before restoring
  await createVersion(brandId, orgId, 'Auto-snapshot before restore');

  // Restore snapshot data as current design system
  const snapshot = targetVersion.snapshot as Record<string, unknown>;

  const [updated] = await db
    .update(designSystems)
    .set({
      colorPalette: snapshot.colorPalette,
      typography: snapshot.typography,
      layoutStructures: snapshot.layoutStructures,
      imageTreatment: snapshot.imageTreatment,
      copyPatterns: snapshot.copyPatterns,
      logoUsage: snapshot.logoUsage,
      confidenceScores: snapshot.confidenceScores,
      updatedAt: new Date(),
    })
    .where(eq(designSystems.id, existing.id))
    .returning();

  return updated;
}

// ─── Regional Variant Updates ────────────────────────────────────────

export async function updateVariant(
  brandId: string,
  orgId: string,
  variantId: string,
  overrides: Partial<{
    colorOverrides: unknown;
    typographyOverrides: unknown;
    copyOverrides: unknown;
    culturalNotes: unknown;
  }>,
) {
  const [existing] = await db
    .select()
    .from(designSystems)
    .where(eq(designSystems.brandId, brandId));

  if (!existing) {
    throw new HTTPException(404, {
      message: 'No design system found for this brand',
    });
  }

  // Verify the variant belongs to this design system
  const [variant] = await db
    .select()
    .from(regionalVariants)
    .where(
      and(
        eq(regionalVariants.id, variantId),
        eq(regionalVariants.designSystemId, existing.id),
      ),
    );

  if (!variant) {
    throw new HTTPException(404, { message: 'Regional variant not found' });
  }

  const [updated] = await db
    .update(regionalVariants)
    .set({
      ...overrides,
      updatedAt: new Date(),
    })
    .where(eq(regionalVariants.id, variantId))
    .returning();

  return updated;
}
