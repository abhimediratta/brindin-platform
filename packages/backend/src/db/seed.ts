import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './index.js';
import {
  organizations,
  users,
  brands,
  brandCreatives,
  designSystems,
  designSystemVersions,
  regionalVariants,
  extractionJobs,
  intelligenceEntries,
  usageEvents,
  usageSummaries,
  campaignBriefs,
} from './schema.js';

// ─── Stable UUIDs ────────────────────────────────────────────────────

const IDS = {
  org: '00000000-0000-4000-a000-000000000001',

  users: {
    priya: '00000000-0000-4000-a001-000000000001',
    arjun: '00000000-0000-4000-a001-000000000002',
    kavitha: '00000000-0000-4000-a001-000000000003',
  },

  brands: {
    chaiJunction: '00000000-0000-4000-a002-000000000001',
    urbanWeave: '00000000-0000-4000-a002-000000000002',
  },

  creatives: {
    cj1: '00000000-0000-4000-a003-000000000001',
    cj2: '00000000-0000-4000-a003-000000000002',
    cj3: '00000000-0000-4000-a003-000000000003',
    cj4: '00000000-0000-4000-a003-000000000004',
    cj5: '00000000-0000-4000-a003-000000000005',
    uw1: '00000000-0000-4000-a003-000000000006',
    uw2: '00000000-0000-4000-a003-000000000007',
    uw3: '00000000-0000-4000-a003-000000000008',
    uw4: '00000000-0000-4000-a003-000000000009',
  },

  designSystems: {
    chaiJunction: '00000000-0000-4000-a004-000000000001',
    urbanWeave: '00000000-0000-4000-a004-000000000002',
  },

  dsVersions: {
    cjV1: '00000000-0000-4000-a005-000000000001',
    cjV2: '00000000-0000-4000-a005-000000000002',
  },

  variants: {
    tn: '00000000-0000-4000-a006-000000000001',
    kl: '00000000-0000-4000-a006-000000000002',
    ka: '00000000-0000-4000-a006-000000000003',
  },

  extractionJobs: {
    completed: '00000000-0000-4000-a007-000000000001',
    failed: '00000000-0000-4000-a007-000000000002',
  },

  intelligence: {
    tnColor: '00000000-0000-4000-a008-000000000001',
    pongal: '00000000-0000-4000-a008-000000000002',
    klTypo: '00000000-0000-4000-a008-000000000003',
    dlColor: '00000000-0000-4000-a008-000000000004',
    mhDiwali: '00000000-0000-4000-a008-000000000005',
    pbLayout: '00000000-0000-4000-a008-000000000006',
  },

  usageEvents: {
    e1: '00000000-0000-4000-a009-000000000001',
    e2: '00000000-0000-4000-a009-000000000002',
    e3: '00000000-0000-4000-a009-000000000003',
    e4: '00000000-0000-4000-a009-000000000004',
    e5: '00000000-0000-4000-a009-000000000005',
    e6: '00000000-0000-4000-a009-000000000006',
    e7: '00000000-0000-4000-a009-000000000007',
    e8: '00000000-0000-4000-a009-000000000008',
    e9: '00000000-0000-4000-a009-000000000009',
    e10: '00000000-0000-4000-a009-000000000010',
  },

  usageSummaries: {
    cj: '00000000-0000-4000-a010-000000000001',
    uw: '00000000-0000-4000-a010-000000000002',
  },

  campaignBrief: '00000000-0000-4000-a011-000000000001',
} as const;

// ─── CLI Flags ───────────────────────────────────────────────────────

const args = process.argv.slice(2);
const doReset = args.includes('--reset');
const onlyIdx = args.indexOf('--only');
const onlyTables = onlyIdx !== -1 ? args[onlyIdx + 1]?.split(',') : null;

function shouldSeed(table: string): boolean {
  return onlyTables === null || onlyTables.includes(table);
}

// ─── Seed Functions ──────────────────────────────────────────────────

async function resetAll() {
  console.log('Truncating all tables (CASCADE)...');
  await db.execute(sql`
    TRUNCATE
      campaign_briefs,
      usage_summaries,
      usage_events,
      intelligence_entries,
      extraction_jobs,
      regional_variants,
      design_system_versions,
      design_systems,
      brand_creatives,
      brands,
      users,
      organizations
    CASCADE
  `);
  console.log('  Done.\n');
}

async function seedOrganization() {
  console.log('Seeding organization...');
  await db
    .insert(organizations)
    .values({
      id: IDS.org,
      name: 'Brindin Demo',
      slug: 'brindin-demo',
      plan: 'pro',
    })
    .onConflictDoUpdate({
      target: organizations.id,
      set: { name: 'Brindin Demo', slug: 'brindin-demo', plan: 'pro' },
    });
  console.log('  ✓ Brindin Demo\n');
}

async function seedUsers() {
  console.log('Seeding users...');
  const data = [
    { id: IDS.users.priya, orgId: IDS.org, email: 'priya@brindin.com', name: 'Priya Sharma', role: 'admin' },
    { id: IDS.users.arjun, orgId: IDS.org, email: 'arjun@brindin.com', name: 'Arjun Mehta', role: 'manager' },
    { id: IDS.users.kavitha, orgId: IDS.org, email: 'kavitha@brindin.com', name: 'Kavitha Nair', role: 'designer' },
  ];
  for (const u of data) {
    await db.insert(users).values(u).onConflictDoUpdate({
      target: users.id,
      set: { email: u.email, name: u.name, role: u.role },
    });
    console.log(`  ✓ ${u.name} (${u.role})`);
  }
  console.log('');
}

async function seedBrands() {
  console.log('Seeding brands...');
  const data = [
    {
      id: IDS.brands.chaiJunction,
      orgId: IDS.org,
      name: 'Chai Junction',
      slug: 'chai-junction',
      categoryVertical: 'FMCG',
      categorySub: 'beverages',
      targetGeographies: ['TN', 'KL', 'KA'],
      description: 'Premium regional chai brand bringing authentic South Indian flavors to every cup.',
    },
    {
      id: IDS.brands.urbanWeave,
      orgId: IDS.org,
      name: 'UrbanWeave',
      slug: 'urbanweave',
      categoryVertical: 'Fashion',
      categorySub: 'apparel',
      targetGeographies: ['DL', 'MH', 'PB'],
      description: 'Contemporary Indian fashion blending traditional weaves with modern silhouettes.',
    },
  ];
  for (const b of data) {
    await db.insert(brands).values(b).onConflictDoUpdate({
      target: brands.id,
      set: {
        name: b.name,
        slug: b.slug,
        categoryVertical: b.categoryVertical,
        categorySub: b.categorySub,
        targetGeographies: b.targetGeographies,
        description: b.description,
        updatedAt: new Date(),
      },
    });
    console.log(`  ✓ ${b.name}`);
  }
  console.log('');
}

async function seedCreatives() {
  console.log('Seeding brand creatives...');
  const data = [
    // Chai Junction creatives
    {
      id: IDS.creatives.cj1, brandId: IDS.brands.chaiJunction,
      fileUrl: '/assets/chai-junction/hero-banner.jpg', fileType: 'image/jpeg',
      originalFilename: 'chai-junction-hero-banner.jpg', fileSizeBytes: 524288,
      dimensions: { width: 1920, height: 1080 },
      analysis: { subject: 'Hero banner with steaming chai cup and spices', mood: 'warm, inviting', textContent: 'Taste the Tradition' },
      colorAnalysis: { dominant: '#8B4513', palette: ['#8B4513', '#D2691E', '#F4A460', '#2E8B57', '#FFFFF0'] },
    },
    {
      id: IDS.creatives.cj2, brandId: IDS.brands.chaiJunction,
      fileUrl: '/assets/chai-junction/instagram-post.jpg', fileType: 'image/jpeg',
      originalFilename: 'instagram-masala-chai.jpg', fileSizeBytes: 312000,
      dimensions: { width: 1080, height: 1080 },
      analysis: { subject: 'Masala chai close-up with cardamom pods', mood: 'artisanal, authentic', textContent: '#ChaiJunction #MasalaChai' },
      colorAnalysis: { dominant: '#D2691E', palette: ['#D2691E', '#8B4513', '#FFD700', '#FFFFF0', '#2E8B57'] },
    },
    {
      id: IDS.creatives.cj3, brandId: IDS.brands.chaiJunction,
      fileUrl: '/assets/chai-junction/print-poster.jpg', fileType: 'image/jpeg',
      originalFilename: 'chai-junction-print-a3.jpg', fileSizeBytes: 1048576,
      dimensions: { width: 3508, height: 4961 },
      analysis: { subject: 'Print poster with chai preparation ritual', mood: 'heritage, cultural', textContent: 'Every Sip Tells a Story' },
      colorAnalysis: { dominant: '#F4A460', palette: ['#F4A460', '#8B4513', '#D2691E', '#FFD700', '#FFF8DC'] },
    },
    {
      id: IDS.creatives.cj4, brandId: IDS.brands.chaiJunction,
      fileUrl: '/assets/chai-junction/story-promo.jpg', fileType: 'image/jpeg',
      originalFilename: 'chai-story-promo.jpg', fileSizeBytes: 204800,
      dimensions: { width: 1080, height: 1920 },
      analysis: { subject: 'Story format with morning chai scene', mood: 'energetic, daily ritual', textContent: 'Start Your Morning Right' },
      colorAnalysis: { dominant: '#FFD700', palette: ['#FFD700', '#D2691E', '#8B4513', '#FFFFF0', '#FF6347'] },
    },
    {
      id: IDS.creatives.cj5, brandId: IDS.brands.chaiJunction,
      fileUrl: '/assets/chai-junction/facebook-post.jpg', fileType: 'image/jpeg',
      originalFilename: 'chai-junction-fb.jpg', fileSizeBytes: 286720,
      dimensions: { width: 1200, height: 630 },
      analysis: { subject: 'Family sharing chai at sunset', mood: 'togetherness, warmth', textContent: 'Share a Cup, Share a Moment' },
      colorAnalysis: { dominant: '#FF8C00', palette: ['#FF8C00', '#8B4513', '#FFD700', '#FFA07A', '#FFFFF0'] },
    },
    // UrbanWeave creatives
    {
      id: IDS.creatives.uw1, brandId: IDS.brands.urbanWeave,
      fileUrl: '/assets/urbanweave/lookbook-cover.jpg', fileType: 'image/jpeg',
      originalFilename: 'uw-lookbook-ss25.jpg', fileSizeBytes: 819200,
      dimensions: { width: 2400, height: 3200 },
      analysis: { subject: 'Model in handloom saree with modern draping', mood: 'contemporary, elegant', textContent: 'Spring/Summer 2025' },
      colorAnalysis: { dominant: '#4B0082', palette: ['#4B0082', '#CD853F', '#FFFFF0', '#2F4F4F', '#DAA520'] },
    },
    {
      id: IDS.creatives.uw2, brandId: IDS.brands.urbanWeave,
      fileUrl: '/assets/urbanweave/instagram-collection.jpg', fileType: 'image/jpeg',
      originalFilename: 'uw-ikat-collection.jpg', fileSizeBytes: 409600,
      dimensions: { width: 1080, height: 1350 },
      analysis: { subject: 'Ikat print kurta flatlay', mood: 'artisanal, curated', textContent: 'The Ikat Edit' },
      colorAnalysis: { dominant: '#CD853F', palette: ['#CD853F', '#4B0082', '#FFFFF0', '#8B0000', '#DAA520'] },
    },
    {
      id: IDS.creatives.uw3, brandId: IDS.brands.urbanWeave,
      fileUrl: '/assets/urbanweave/banner-sale.jpg', fileType: 'image/jpeg',
      originalFilename: 'uw-festive-sale-banner.jpg', fileSizeBytes: 368640,
      dimensions: { width: 1920, height: 600 },
      analysis: { subject: 'Festive sale banner with textile patterns', mood: 'festive, luxurious', textContent: 'Festive Collection — Up to 40% Off' },
      colorAnalysis: { dominant: '#8B0000', palette: ['#8B0000', '#DAA520', '#4B0082', '#FFFFF0', '#CD853F'] },
    },
    {
      id: IDS.creatives.uw4, brandId: IDS.brands.urbanWeave,
      fileUrl: '/assets/urbanweave/story-bts.jpg', fileType: 'image/jpeg',
      originalFilename: 'uw-behind-the-loom.jpg', fileSizeBytes: 245760,
      dimensions: { width: 1080, height: 1920 },
      analysis: { subject: 'Weaver at traditional loom', mood: 'authentic, craft-focused', textContent: 'Behind the Loom' },
      colorAnalysis: { dominant: '#DAA520', palette: ['#DAA520', '#CD853F', '#2F4F4F', '#FFFFF0', '#4B0082'] },
    },
  ];

  for (const c of data) {
    await db.insert(brandCreatives).values(c).onConflictDoUpdate({
      target: brandCreatives.id,
      set: {
        fileUrl: c.fileUrl,
        fileType: c.fileType,
        dimensions: c.dimensions,
        analysis: c.analysis,
        colorAnalysis: c.colorAnalysis,
      },
    });
  }
  console.log(`  ✓ ${data.length} creatives (5 Chai Junction + 4 UrbanWeave)\n`);
}

async function seedDesignSystems() {
  console.log('Seeding design systems...');
  const data = [
    {
      id: IDS.designSystems.chaiJunction,
      brandId: IDS.brands.chaiJunction,
      version: 2,
      status: 'active',
      colorPalette: {
        primary: { hex: '#8B4513', name: 'Chai Brown' },
        secondary: { hex: '#D2691E', name: 'Cinnamon' },
        accent: { hex: '#FFD700', name: 'Turmeric Gold' },
        neutral: { hex: '#FFF8DC', name: 'Cornsilk' },
        palette: ['#8B4513', '#D2691E', '#FFD700', '#2E8B57', '#FFF8DC'],
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Nunito Sans',
        headingWeight: 700,
        bodyWeight: 400,
        scale: 1.25,
      },
      layoutStructures: {
        preferred: ['hero-centered', 'split-image-text', 'grid-3col'],
        density: 'medium',
        margins: { desktop: 80, mobile: 16 },
      },
      imageTreatment: {
        style: 'warm-filter',
        cornerRadius: 8,
        shadowStyle: 'soft-drop',
        overlayOpacity: 0.15,
      },
      copyPatterns: {
        tone: 'warm, inviting, heritage-inspired',
        cta: ['Explore Flavors', 'Order Now', 'Find a Store'],
        tagline: 'Taste the Tradition',
      },
      logoUsage: {
        minSize: 32,
        clearSpace: '1x height',
        darkBackground: 'white-variant',
        lightBackground: 'brown-variant',
      },
    },
    {
      id: IDS.designSystems.urbanWeave,
      brandId: IDS.brands.urbanWeave,
      version: 1,
      status: 'draft',
      colorPalette: {
        primary: { hex: '#4B0082', name: 'Indigo' },
        secondary: { hex: '#CD853F', name: 'Terracotta' },
        accent: { hex: '#DAA520', name: 'Goldenrod' },
        neutral: { hex: '#FFFFF0', name: 'Ivory' },
        palette: ['#4B0082', '#CD853F', '#DAA520', '#2F4F4F', '#FFFFF0'],
      },
      typography: {
        headingFont: 'DM Serif Display',
        bodyFont: 'Inter',
        headingWeight: 400,
        bodyWeight: 400,
        scale: 1.333,
      },
      layoutStructures: {
        preferred: ['full-bleed-hero', 'lookbook-grid', 'editorial-single'],
        density: 'low',
        margins: { desktop: 120, mobile: 24 },
      },
      imageTreatment: {
        style: 'natural-light',
        cornerRadius: 0,
        shadowStyle: 'none',
        overlayOpacity: 0,
      },
      copyPatterns: {
        tone: 'sophisticated, contemporary, craft-forward',
        cta: ['Shop the Collection', 'Discover the Craft', 'View Lookbook'],
        tagline: 'Woven for the Modern World',
      },
      logoUsage: {
        minSize: 40,
        clearSpace: '1.5x height',
        darkBackground: 'ivory-variant',
        lightBackground: 'indigo-variant',
      },
    },
  ];

  for (const ds of data) {
    await db.insert(designSystems).values(ds).onConflictDoUpdate({
      target: designSystems.id,
      set: {
        version: ds.version,
        status: ds.status,
        colorPalette: ds.colorPalette,
        typography: ds.typography,
        layoutStructures: ds.layoutStructures,
        imageTreatment: ds.imageTreatment,
        copyPatterns: ds.copyPatterns,
        logoUsage: ds.logoUsage,
        updatedAt: new Date(),
      },
    });
    console.log(`  ✓ ${ds.status === 'active' ? 'Chai Junction' : 'UrbanWeave'} (${ds.status}, v${ds.version})`);
  }
  console.log('');
}

async function seedDesignSystemVersions() {
  console.log('Seeding design system versions...');
  const data = [
    {
      id: IDS.dsVersions.cjV1,
      designSystemId: IDS.designSystems.chaiJunction,
      version: 1,
      snapshot: { note: 'Initial extraction from 5 brand creatives' },
      changeSummary: 'Initial design system extraction — base palette and typography identified',
      changedBy: IDS.users.priya,
    },
    {
      id: IDS.dsVersions.cjV2,
      designSystemId: IDS.designSystems.chaiJunction,
      version: 2,
      snapshot: { note: 'Refined palette + regional font additions' },
      changeSummary: 'Refined color palette with warmer tones, added Noto Sans Tamil for regional creatives',
      changedBy: IDS.users.kavitha,
    },
  ];

  for (const v of data) {
    await db.insert(designSystemVersions).values(v).onConflictDoUpdate({
      target: designSystemVersions.id,
      set: {
        snapshot: v.snapshot,
        changeSummary: v.changeSummary,
      },
    });
    console.log(`  ✓ Chai Junction v${v.version}`);
  }
  console.log('');
}

async function seedRegionalVariants() {
  console.log('Seeding regional variants...');
  const data = [
    {
      id: IDS.variants.tn,
      designSystemId: IDS.designSystems.chaiJunction,
      regionCode: 'TN',
      language: 'ta',
      colorOverrides: { accent: { hex: '#C41E3A', name: 'Temple Red' } },
      typographyOverrides: { headingFont: 'Noto Sans Tamil', headingWeight: 700 },
      copyOverrides: { tone: 'Bold Tamil headlines, cinema-style dialogue rhythm', cta: ['இப்போதே ருசிக்கவும்', 'Order Now'] },
      culturalNotes: { style: 'Bold, dramatic, cinema-influenced', avoid: ['Hindi-first text', 'Minimalist whitespace'] },
    },
    {
      id: IDS.variants.kl,
      designSystemId: IDS.designSystems.chaiJunction,
      regionCode: 'KL',
      language: 'ml',
      colorOverrides: { accent: { hex: '#2E8B57', name: 'Kerala Green' } },
      typographyOverrides: { headingFont: 'Noto Sans Malayalam', headingWeight: 500 },
      copyOverrides: { tone: 'Clean, informative Malayalam copy with education-oriented trust signals', cta: ['കൂടുതൽ അറിയുക', 'Explore'] },
      culturalNotes: { style: 'Clean, literary, education-proud', avoid: ['Flashy oversaturated design', 'Celebrity-worship'] },
    },
    {
      id: IDS.variants.ka,
      designSystemId: IDS.designSystems.chaiJunction,
      regionCode: 'KA',
      language: 'kn',
      colorOverrides: { accent: { hex: '#DAA520', name: 'Sandalwood Gold' } },
      typographyOverrides: { headingFont: 'Noto Sans Kannada', headingWeight: 500 },
      copyOverrides: { tone: 'Balanced Kannada copy bridging tech and tradition', cta: ['ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ', 'Shop Now'] },
      culturalNotes: { style: 'Tech-meets-tradition, balanced', avoid: ['Hindi-dominant copy', 'Pure Western-minimal'] },
    },
  ];

  for (const v of data) {
    await db.insert(regionalVariants).values(v).onConflictDoUpdate({
      target: regionalVariants.id,
      set: {
        colorOverrides: v.colorOverrides,
        typographyOverrides: v.typographyOverrides,
        copyOverrides: v.copyOverrides,
        culturalNotes: v.culturalNotes,
        updatedAt: new Date(),
      },
    });
    console.log(`  ✓ ${v.regionCode}/${v.language}`);
  }
  console.log('');
}

async function seedExtractionJobs() {
  console.log('Seeding extraction jobs...');
  const now = new Date();
  const data = [
    {
      id: IDS.extractionJobs.completed,
      brandId: IDS.brands.chaiJunction,
      status: 'completed',
      totalImages: 5,
      processedImages: 5,
      excludedImages: 0,
      stage: 'complete',
      progress: 100,
      startedAt: new Date(now.getTime() - 300_000),
      completedAt: now,
    },
    {
      id: IDS.extractionJobs.failed,
      brandId: IDS.brands.urbanWeave,
      status: 'failed',
      totalImages: 4,
      processedImages: 1,
      excludedImages: 0,
      stage: 'analyzing',
      progress: 33,
      errorMessage: 'Timeout: AI analysis exceeded 120s limit on image 2/4',
      startedAt: new Date(now.getTime() - 180_000),
    },
  ];

  for (const j of data) {
    await db.insert(extractionJobs).values(j).onConflictDoUpdate({
      target: extractionJobs.id,
      set: {
        status: j.status,
        processedImages: j.processedImages,
        progress: j.progress,
        errorMessage: j.errorMessage ?? null,
      },
    });
    console.log(`  ✓ ${j.status} (${j.progress}%)`);
  }
  console.log('');
}

async function seedIntelligence() {
  console.log('Seeding intelligence entries...');
  const now = new Date();
  const data = [
    {
      id: IDS.intelligence.tnColor,
      dimension: 'color',
      geographyState: 'TN',
      categoryVertical: 'FMCG',
      entryType: 'preference',
      title: 'Tamil Nadu FMCG Color Preferences',
      content: {
        preferredHues: ['red', 'gold', 'deep-blue', 'maroon'],
        saturation: 'high',
        contrast: 'high',
        notes: 'Jewel tones perform best. Avoid pale/pastel palettes in mass-market FMCG.',
      },
      summary: 'TN FMCG audiences prefer high-saturation jewel tones — reds, golds, deep blues.',
      confidenceTier: 2,
      source: 'market-research-2024',
      sampleSize: 1200,
      lastVerified: now,
      sourceType: 'curated' as const,
    },
    {
      id: IDS.intelligence.pongal,
      dimension: 'festival',
      geographyState: 'TN',
      festival: 'Pongal',
      entryType: 'guideline',
      title: 'Pongal Creative Guidelines',
      content: {
        colors: ['yellow', 'orange', 'green'],
        motifs: ['pongal pot', 'sugarcane', 'kolam', 'sun'],
        timing: 'Campaigns should launch 2 weeks before Pongal (mid-January)',
        tone: 'Harvest celebration, family togetherness, gratitude',
      },
      summary: 'Pongal creatives need harvest themes (yellows/oranges), kolam motifs, family focus.',
      confidenceTier: 2,
      source: 'cultural-advisory-panel',
      lastVerified: now,
      sourceType: 'curated' as const,
    },
    {
      id: IDS.intelligence.klTypo,
      dimension: 'typography',
      geographyState: 'KL',
      entryType: 'preference',
      title: 'Kerala Typography Preferences',
      content: {
        weight: 'medium',
        style: 'Clean, readable Malayalam with proper script rendering',
        notes: 'Highest literacy state — audiences read carefully. Prefer clarity over flash.',
      },
      summary: 'Kerala values clean, well-rendered Malayalam typography — clarity over decorative impact.',
      confidenceTier: 2,
      source: 'market-research-2024',
      sampleSize: 800,
      lastVerified: now,
      sourceType: 'curated' as const,
    },
    {
      id: IDS.intelligence.dlColor,
      dimension: 'color',
      geographyState: 'DL',
      categoryVertical: 'Fashion',
      entryType: 'preference',
      title: 'Delhi Fashion Color Preferences',
      content: {
        preferredHues: ['black', 'gold', 'royal-blue', 'white'],
        saturation: 'high',
        notes: 'Metro-aspirational palette. Bold contrasts with premium feel.',
      },
      summary: 'Delhi fashion audiences prefer bold black/gold/royal-blue — metro-aspirational palette.',
      confidenceTier: 2,
      source: 'market-research-2024',
      sampleSize: 950,
      lastVerified: now,
      sourceType: 'curated' as const,
    },
    {
      id: IDS.intelligence.mhDiwali,
      dimension: 'festival',
      geographyState: 'MH',
      festival: 'Diwali',
      entryType: 'guideline',
      title: 'Diwali Creative Guidelines — Maharashtra',
      content: {
        colors: ['red', 'gold', 'purple'],
        motifs: ['diya', 'rangoli', 'lanterns', 'sweets'],
        timing: 'Start campaigns 3 weeks before Diwali',
        tone: 'Prosperity, family celebration, new beginnings',
      },
      summary: 'Maharashtra Diwali creatives need warm golds/reds, rangoli motifs, prosperity themes.',
      confidenceTier: 2,
      source: 'cultural-advisory-panel',
      lastVerified: now,
      sourceType: 'curated' as const,
    },
    {
      id: IDS.intelligence.pbLayout,
      dimension: 'layout',
      geographyState: 'PB',
      entryType: 'guideline',
      title: 'Punjab Layout Density Guidelines',
      content: {
        density: 'high',
        whitespaceTolerance: 'low',
        elements: '5-10 per creative',
        cta: 'Big, bold, warm — action-oriented with family appeal',
        notes: 'Sparse designs feel cold. Punjab expects visual abundance and warmth.',
      },
      summary: 'Punjab audiences expect high-density layouts with warmth — sparse feels unwelcoming.',
      confidenceTier: 1,
      source: 'ai-drafted-v1',
      lastVerified: now,
      sourceType: 'curated' as const,
    },
  ];

  for (const entry of data) {
    await db.insert(intelligenceEntries).values(entry).onConflictDoUpdate({
      target: intelligenceEntries.id,
      set: {
        title: entry.title,
        content: entry.content,
        summary: entry.summary,
        updatedAt: new Date(),
      },
    });
    console.log(`  ✓ ${entry.title}`);
  }
  console.log('');
}

async function seedUsageEvents() {
  console.log('Seeding usage events...');
  const baseDate = new Date('2025-11-15T10:00:00Z');
  const data = [
    { id: IDS.usageEvents.e1, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'storage_upload', quantity: '5', unit: 'files', createdAt: new Date(baseDate.getTime()) },
    { id: IDS.usageEvents.e2, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'image_processed', quantity: '5', unit: 'images', createdAt: new Date(baseDate.getTime() + 60_000) },
    { id: IDS.usageEvents.e3, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'extraction_completed', quantity: '1', unit: 'extractions', createdAt: new Date(baseDate.getTime() + 300_000) },
    { id: IDS.usageEvents.e4, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'ai_analysis', quantity: '5', unit: 'calls', costMicrodollars: 25000, createdAt: new Date(baseDate.getTime() + 120_000) },
    { id: IDS.usageEvents.e5, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'variant_generated', quantity: '3', unit: 'variants', createdAt: new Date(baseDate.getTime() + 600_000) },
    { id: IDS.usageEvents.e6, orgId: IDS.org, brandId: IDS.brands.urbanWeave, eventType: 'storage_upload', quantity: '4', unit: 'files', createdAt: new Date(baseDate.getTime() + 86400_000) },
    { id: IDS.usageEvents.e7, orgId: IDS.org, brandId: IDS.brands.urbanWeave, eventType: 'image_processed', quantity: '1', unit: 'images', createdAt: new Date(baseDate.getTime() + 86460_000) },
    { id: IDS.usageEvents.e8, orgId: IDS.org, brandId: IDS.brands.urbanWeave, eventType: 'ai_analysis', quantity: '1', unit: 'calls', costMicrodollars: 5000, createdAt: new Date(baseDate.getTime() + 86520_000) },
    { id: IDS.usageEvents.e9, orgId: IDS.org, brandId: IDS.brands.chaiJunction, eventType: 'brief_generated', quantity: '1', unit: 'briefs', createdAt: new Date(baseDate.getTime() + 900_000) },
    { id: IDS.usageEvents.e10, orgId: IDS.org, brandId: IDS.brands.urbanWeave, eventType: 'storage_upload', quantity: '2', unit: 'files', createdAt: new Date(baseDate.getTime() + 172800_000) },
  ];

  for (const e of data) {
    await db.insert(usageEvents).values(e).onConflictDoUpdate({
      target: usageEvents.id,
      set: { eventType: e.eventType, quantity: e.quantity },
    });
  }
  console.log(`  ✓ ${data.length} usage events\n`);
}

async function seedUsageSummaries() {
  console.log('Seeding usage summaries...');
  const data = [
    {
      id: IDS.usageSummaries.cj,
      orgId: IDS.org,
      brandId: IDS.brands.chaiJunction,
      month: '2025-11-01',
      extractions: 1,
      imagesProcessed: 5,
      generations: 1,
      variantsGenerated: 3,
      evaluations: 0,
      storageBytesAdded: 2_376_704,
      aiCostMicrodollars: 25_000,
    },
    {
      id: IDS.usageSummaries.uw,
      orgId: IDS.org,
      brandId: IDS.brands.urbanWeave,
      month: '2025-11-01',
      extractions: 0,
      imagesProcessed: 1,
      generations: 0,
      variantsGenerated: 0,
      evaluations: 0,
      storageBytesAdded: 1_843_200,
      aiCostMicrodollars: 5_000,
    },
  ];

  for (const s of data) {
    await db.insert(usageSummaries).values(s).onConflictDoUpdate({
      target: usageSummaries.id,
      set: {
        extractions: s.extractions,
        imagesProcessed: s.imagesProcessed,
        generations: s.generations,
        variantsGenerated: s.variantsGenerated,
        storageBytesAdded: s.storageBytesAdded,
        aiCostMicrodollars: s.aiCostMicrodollars,
        updatedAt: new Date(),
      },
    });
    console.log(`  ✓ ${s.brandId === IDS.brands.chaiJunction ? 'Chai Junction' : 'UrbanWeave'} (2025-11)`);
  }
  console.log('');
}

async function seedCampaignBrief() {
  console.log('Seeding campaign brief...');
  const brief = {
    id: IDS.campaignBrief,
    brandId: IDS.brands.chaiJunction,
    targetGeography: 'TN',
    targetSegment: 'Urban millennials, 25-35, chai enthusiasts',
    objective: 'Drive awareness and trial during Pongal season',
    timePeriod: { start: '2026-01-01', end: '2026-01-20', festival: 'Pongal' },
    generatedContent: {
      headlines: [
        'பொங்கல் சிறப்பு — சூடான சாய் உங்கள் கையில்',
        'இந்த பொங்கலுக்கு Chai Junction-ல் புது சுவை',
      ],
      visualDirection: 'Warm harvest palette (yellow, orange, green), kolam motifs, steaming chai imagery',
      channels: ['Instagram', 'Facebook', 'print-outdoor'],
      toneNotes: 'Celebratory, family-focused, Tamil-first with English accents',
    },
    evidenceCitations: [
      { entryId: IDS.intelligence.tnColor, relevance: 'Color palette selection' },
      { entryId: IDS.intelligence.pongal, relevance: 'Festival timing and motifs' },
    ],
    intelligenceEntriesReferenced: [IDS.intelligence.tnColor, IDS.intelligence.pongal],
    status: 'draft',
    createdBy: IDS.users.arjun,
  };

  await db.insert(campaignBriefs).values(brief).onConflictDoUpdate({
    target: campaignBriefs.id,
    set: {
      generatedContent: brief.generatedContent,
      evidenceCitations: brief.evidenceCitations,
      status: brief.status,
      updatedAt: new Date(),
    },
  });
  console.log('  ✓ Chai Junction — Pongal TN Campaign\n');
}

// ─── Main Runner ─────────────────────────────────────────────────────

const seedSteps: [string, () => Promise<void>][] = [
  ['organizations', seedOrganization],
  ['users', seedUsers],
  ['brands', seedBrands],
  ['brand_creatives', seedCreatives],
  ['design_systems', seedDesignSystems],
  ['design_system_versions', seedDesignSystemVersions],
  ['regional_variants', seedRegionalVariants],
  ['extraction_jobs', seedExtractionJobs],
  ['intelligence_entries', seedIntelligence],
  ['usage_events', seedUsageEvents],
  ['usage_summaries', seedUsageSummaries],
  ['campaign_briefs', seedCampaignBrief],
];

async function main() {
  console.log('━━━ Brindin Platform — Database Seed ━━━\n');

  if (doReset) {
    await resetAll();
  }

  for (const [table, fn] of seedSteps) {
    if (shouldSeed(table)) {
      await fn();
    }
  }

  console.log('━━━ Seed complete ━━━');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
