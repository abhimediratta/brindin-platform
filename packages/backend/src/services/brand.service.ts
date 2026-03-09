import { eq, and, desc } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { db } from '../db/index.js';
import { brands, brandCreatives } from '../db/schema.js';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export async function createBrand(
  orgId: string,
  data: {
    name: string;
    slug?: string;
    description?: string;
    categoryVertical?: string;
    categorySub?: string;
    targetGeographies?: string[];
    logoUrl?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const slug = data.slug || generateSlug(data.name);

  try {
    const [brand] = await db
      .insert(brands)
      .values({
        orgId,
        name: data.name,
        slug,
        description: data.description,
        categoryVertical: data.categoryVertical,
        categorySub: data.categorySub,
        targetGeographies: data.targetGeographies,
        logoUrl: data.logoUrl,
        metadata: data.metadata,
      })
      .returning();

    return brand;
  } catch (err: any) {
    if (err.code === '23505') {
      throw new HTTPException(409, {
        message: `Brand with slug "${slug}" already exists in this organization`,
      });
    }
    throw err;
  }
}

export async function listBrands(orgId: string) {
  return db
    .select()
    .from(brands)
    .where(eq(brands.orgId, orgId))
    .orderBy(desc(brands.createdAt));
}

export async function getBrandById(orgId: string, brandId: string) {
  const [brand] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.id, brandId), eq(brands.orgId, orgId)));

  return brand ?? null;
}

export async function createCreativeRecord(
  brandId: string,
  data: {
    fileUrl: string;
    fileType: string;
    fileSizeBytes: number;
    originalFilename: string;
    dimensions?: { width: number; height: number };
  },
) {
  const [creative] = await db
    .insert(brandCreatives)
    .values({
      brandId,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSizeBytes: data.fileSizeBytes,
      originalFilename: data.originalFilename,
      dimensions: data.dimensions,
    })
    .returning();

  return creative;
}

export async function listCreatives(
  brandId: string,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {},
) {
  return db
    .select()
    .from(brandCreatives)
    .where(eq(brandCreatives.brandId, brandId))
    .orderBy(desc(brandCreatives.uploadDate))
    .limit(limit)
    .offset(offset);
}
