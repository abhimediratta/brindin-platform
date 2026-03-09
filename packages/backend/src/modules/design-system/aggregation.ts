// Phase 2D — Aggregation Engine
// Pure data-processing: cluster colors, aggregate patterns, detect inconsistencies

// --- Input Types (match Python color extractor + Claude Vision output) ---

export interface ColorAnalysisColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  lab: { l: number; a: number; b: number };
  percentage: number;
}

export interface ColorAnalysis {
  colors: ColorAnalysisColor[];
  dominantColor: { hex: string; rgb: { r: number; g: number; b: number } };
  backgroundColor: { hex: string; rgb: { r: number; g: number; b: number } };
  colorCount: number;
}

export interface VisionAnalysis {
  layoutType: string;
  layoutDescription: string;
  typography: {
    headlineFont: string | null;
    bodyFont: string | null;
    fontSizes: string[];
    fontWeights: string[];
    textAlignment: string;
  };
  copy: {
    headline: string | null;
    subheadline: string | null;
    bodyText: string | null;
    ctaText: string | null;
    tone: string;
  };
  imageTreatment: {
    style: string;
    hasOverlay: boolean;
    overlayType: string | null;
    filterEffect: string | null;
    cropStyle: string;
  };
  logoPresent: boolean;
  logoPosition: string | null;
}

export interface AnalyzedCreative {
  id: string;
  colorAnalysis: ColorAnalysis;
  analysis: VisionAnalysis;
}

// --- Output Types ---

export interface ClusteredColor {
  hex: string;
  lab: { l: number; a: number; b: number };
  frequency: number;
  confidence: 'strong' | 'moderate' | 'emerging';
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'other';
  creativeCount: number;
}

export interface AggregatedTypography {
  fonts: {
    family: string;
    type: 'serif' | 'sans' | 'display';
    role: 'heading' | 'body' | 'cta';
    frequency: number;
  }[];
  fontSizes: string[];
  fontWeights: string[];
}

export interface AggregatedLayouts {
  layouts: { type: string; frequency: number }[];
  dominantLayout: string;
}

export interface AggregatedCopyPatterns {
  tones: { tone: string; frequency: number }[];
  dominantTone: string;
  ctaTexts: { text: string; count: number }[];
  structurePatterns: { pattern: string; frequency: number }[];
}

export interface AggregatedImageTreatment {
  styles: { style: string; frequency: number }[];
  dominantStyle: string;
  filterEffects: { effect: string; frequency: number }[];
  overlayUsageRate: number;
}

export interface AggregatedLogoUsage {
  presenceRate: number;
  positions: { position: string; frequency: number }[];
  preferredPosition: string | null;
}

export interface Inconsistency {
  dimension: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  exampleCreativeIds: string[];
}

export interface AggregatedResult {
  colorPalette: ClusteredColor[];
  typography: AggregatedTypography;
  layoutStructures: AggregatedLayouts;
  imageTreatment: AggregatedImageTreatment;
  copyPatterns: AggregatedCopyPatterns;
  logoUsage: AggregatedLogoUsage;
  inconsistencies: Inconsistency[];
}

// --- Helpers ---

const SERIF_FAMILIES = new Set([
  'times', 'times new roman', 'georgia', 'garamond', 'palatino', 'book antiqua',
  'cambria', 'didot', 'bodoni', 'caslon', 'baskerville', 'merriweather',
  'playfair display', 'lora', 'libre baskerville', 'pt serif', 'noto serif',
  'source serif pro', 'eb garamond', 'cormorant',
]);

function classifyFontType(family: string): 'serif' | 'sans' | 'display' {
  const lower = family.toLowerCase().trim();
  if (SERIF_FAMILIES.has(lower) || lower.includes('serif')) return 'serif';
  if (lower.includes('display') || lower.includes('script') || lower.includes('handwritten')) return 'display';
  return 'sans';
}

/** CIE76 Delta-E: Euclidean distance in Lab color space */
export function deltaE(
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number },
): number {
  return Math.sqrt(
    (lab1.l - lab2.l) ** 2 +
    (lab1.a - lab2.a) ** 2 +
    (lab1.b - lab2.b) ** 2,
  );
}

function frequencyCount<T extends string | number>(items: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

function topEntries<T extends string>(
  map: Map<T, number>,
  total: number,
): { value: T; frequency: number }[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, frequency: count / total }));
}

/** Compute Lab luminance (L channel) — lower is darker */
function labLuminance(lab: { l: number }): number {
  return lab.l;
}

// --- Sub-functions ---

interface WeightedColor {
  hex: string;
  lab: { l: number; a: number; b: number };
  weight: number; // sum of percentage contributions
  creativeIds: Set<string>;
}

export function clusterColors(creatives: AnalyzedCreative[]): ClusteredColor[] {
  // Collect all non-background colors weighted by percentage
  const allColors: { hex: string; lab: { l: number; a: number; b: number }; weight: number; creativeId: string }[] = [];

  for (const c of creatives) {
    const bgHex = c.colorAnalysis.backgroundColor.hex.toLowerCase();
    for (const color of c.colorAnalysis.colors) {
      if (color.hex.toLowerCase() === bgHex) continue;
      allColors.push({
        hex: color.hex,
        lab: color.lab,
        weight: color.percentage,
        creativeId: c.id,
      });
    }
  }

  if (allColors.length === 0) return [];

  // Greedy clustering: sorted by weight desc, merge if deltaE < 15
  const MERGE_THRESHOLD = 15;
  const MAX_CLUSTERS = 10;

  // Sort by weight descending
  allColors.sort((a, b) => b.weight - a.weight);

  const clusters: WeightedColor[] = [];

  for (const color of allColors) {
    let merged = false;
    for (const cluster of clusters) {
      if (deltaE(color.lab, cluster.lab) < MERGE_THRESHOLD) {
        // Weighted average of Lab values
        const totalWeight = cluster.weight + color.weight;
        cluster.lab = {
          l: (cluster.lab.l * cluster.weight + color.lab.l * color.weight) / totalWeight,
          a: (cluster.lab.a * cluster.weight + color.lab.a * color.weight) / totalWeight,
          b: (cluster.lab.b * cluster.weight + color.lab.b * color.weight) / totalWeight,
        };
        cluster.weight = totalWeight;
        cluster.creativeIds.add(color.creativeId);
        merged = true;
        break;
      }
    }
    if (!merged && clusters.length < MAX_CLUSTERS) {
      clusters.push({
        hex: color.hex,
        lab: { ...color.lab },
        weight: color.weight,
        creativeIds: new Set([color.creativeId]),
      });
    }
  }

  // Sort clusters by weight desc
  clusters.sort((a, b) => b.weight - a.weight);

  const totalWeight = clusters.reduce((s, c) => s + c.weight, 0);
  const totalCreatives = creatives.length;

  // Find background color Lab for role assignment
  const bgLabs = creatives.map((c) => {
    const bgHex = c.colorAnalysis.backgroundColor.hex.toLowerCase();
    const bgColor = c.colorAnalysis.colors.find((col) => col.hex.toLowerCase() === bgHex);
    return bgColor?.lab ?? { l: 95, a: 0, b: 0 }; // default to near-white
  });
  const avgBgLab = {
    l: bgLabs.reduce((s, l) => s + l.l, 0) / bgLabs.length,
    a: bgLabs.reduce((s, l) => s + l.a, 0) / bgLabs.length,
    b: bgLabs.reduce((s, l) => s + l.b, 0) / bgLabs.length,
  };

  // Assign roles
  const assignedRoles = new Set<string>();

  // Find closest to background
  let closestBgIdx = 0;
  let closestBgDist = Infinity;
  for (let i = 0; i < clusters.length; i++) {
    const dist = deltaE(clusters[i].lab, avgBgLab);
    if (dist < closestBgDist) {
      closestBgDist = dist;
      closestBgIdx = i;
    }
  }

  // Find darkest (lowest L)
  let darkestIdx = 0;
  let darkestL = Infinity;
  for (let i = 0; i < clusters.length; i++) {
    if (labLuminance(clusters[i].lab) < darkestL) {
      darkestL = labLuminance(clusters[i].lab);
      darkestIdx = i;
    }
  }

  const roleMap = new Map<number, 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'other'>();
  roleMap.set(closestBgIdx, 'background');
  assignedRoles.add('background');

  if (darkestIdx !== closestBgIdx) {
    roleMap.set(darkestIdx, 'text');
    assignedRoles.add('text');
  }

  // Assign primary, secondary, accent by frequency (skip already assigned)
  const orderedRoles: ('primary' | 'secondary' | 'accent')[] = ['primary', 'secondary', 'accent'];
  let roleIdx = 0;
  for (let i = 0; i < clusters.length && roleIdx < orderedRoles.length; i++) {
    if (!roleMap.has(i)) {
      roleMap.set(i, orderedRoles[roleIdx]);
      roleIdx++;
    }
  }

  return clusters.map((cluster, i): ClusteredColor => {
    const creativeCount = cluster.creativeIds.size;
    const creativeRatio = creativeCount / totalCreatives;
    const confidence: 'strong' | 'moderate' | 'emerging' =
      creativeRatio > 0.7 ? 'strong' :
      creativeRatio >= 0.4 ? 'moderate' : 'emerging';

    return {
      hex: cluster.hex,
      lab: {
        l: Math.round(cluster.lab.l * 100) / 100,
        a: Math.round(cluster.lab.a * 100) / 100,
        b: Math.round(cluster.lab.b * 100) / 100,
      },
      frequency: Math.round((cluster.weight / totalWeight) * 1000) / 1000,
      confidence,
      role: roleMap.get(i) ?? 'other',
      creativeCount,
    };
  });
}

export function aggregateTypography(creatives: AnalyzedCreative[]): AggregatedTypography {
  const headlineFonts: string[] = [];
  const bodyFonts: string[] = [];
  const allSizes = new Set<string>();
  const allWeights = new Set<string>();

  for (const c of creatives) {
    const t = c.analysis.typography;
    if (t.headlineFont) headlineFonts.push(t.headlineFont);
    if (t.bodyFont) bodyFonts.push(t.bodyFont);
    for (const s of t.fontSizes) allSizes.add(s);
    for (const w of t.fontWeights) allWeights.add(w);
  }

  const fonts: AggregatedTypography['fonts'] = [];

  // Headline fonts
  const headlineFreqs = frequencyCount(headlineFonts);
  for (const [family, count] of headlineFreqs) {
    fonts.push({
      family,
      type: classifyFontType(family),
      role: 'heading',
      frequency: count / creatives.length,
    });
  }

  // Body fonts
  const bodyFreqs = frequencyCount(bodyFonts);
  for (const [family, count] of bodyFreqs) {
    // Avoid duplicate if same family is already heading
    if (!headlineFreqs.has(family)) {
      fonts.push({
        family,
        type: classifyFontType(family),
        role: 'body',
        frequency: count / creatives.length,
      });
    }
  }

  // Sort by frequency desc
  fonts.sort((a, b) => b.frequency - a.frequency);

  return {
    fonts,
    fontSizes: [...allSizes],
    fontWeights: [...allWeights],
  };
}

export function analyzeLayouts(creatives: AnalyzedCreative[]): AggregatedLayouts {
  const types = creatives.map((c) => c.analysis.layoutType.toLowerCase().trim());
  const freqs = frequencyCount(types);
  const entries = topEntries(freqs, creatives.length);

  return {
    layouts: entries.map((e) => ({ type: e.value, frequency: e.frequency })),
    dominantLayout: entries[0]?.value ?? 'unknown',
  };
}

export function analyzeCopyPatterns(creatives: AnalyzedCreative[]): AggregatedCopyPatterns {
  const tones = creatives.map((c) => c.analysis.copy.tone.toLowerCase().trim());
  const toneFreqs = frequencyCount(tones);
  const toneEntries = topEntries(toneFreqs, creatives.length);

  // CTA texts
  const ctaTexts: string[] = [];
  for (const c of creatives) {
    if (c.analysis.copy.ctaText) ctaTexts.push(c.analysis.copy.ctaText);
  }
  const ctaFreqs = frequencyCount(ctaTexts);
  const ctaEntries = [...ctaFreqs.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([text, count]) => ({ text, count }));

  // Structure patterns
  const patterns: string[] = [];
  for (const c of creatives) {
    const copy = c.analysis.copy;
    const parts: string[] = [];
    if (copy.headline) parts.push('headline');
    if (copy.subheadline) parts.push('subheadline');
    if (copy.bodyText) parts.push('body');
    if (copy.ctaText) parts.push('cta');
    patterns.push(parts.length > 0 ? parts.join('+') : 'none');
  }
  const patternFreqs = frequencyCount(patterns);
  const patternEntries = topEntries(patternFreqs, creatives.length);

  return {
    tones: toneEntries.map((e) => ({ tone: e.value, frequency: e.frequency })),
    dominantTone: toneEntries[0]?.value ?? 'neutral',
    ctaTexts: ctaEntries,
    structurePatterns: patternEntries.map((e) => ({ pattern: e.value, frequency: e.frequency })),
  };
}

export function analyzeImageTreatment(creatives: AnalyzedCreative[]): AggregatedImageTreatment {
  const styles = creatives.map((c) => c.analysis.imageTreatment.style.toLowerCase().trim());
  const styleFreqs = frequencyCount(styles);
  const styleEntries = topEntries(styleFreqs, creatives.length);

  // Filter effects
  const effects: string[] = [];
  for (const c of creatives) {
    if (c.analysis.imageTreatment.filterEffect) {
      effects.push(c.analysis.imageTreatment.filterEffect.toLowerCase().trim());
    }
  }
  const effectFreqs = frequencyCount(effects);
  const effectEntries = topEntries(effectFreqs, effects.length || 1);

  // Overlay usage rate
  const overlayCount = creatives.filter((c) => c.analysis.imageTreatment.hasOverlay).length;

  return {
    styles: styleEntries.map((e) => ({ style: e.value, frequency: e.frequency })),
    dominantStyle: styleEntries[0]?.value ?? 'unknown',
    filterEffects: effectEntries.map((e) => ({ effect: e.value, frequency: e.frequency })),
    overlayUsageRate: creatives.length > 0 ? overlayCount / creatives.length : 0,
  };
}

export function analyzeLogoUsage(creatives: AnalyzedCreative[]): AggregatedLogoUsage {
  const withLogo = creatives.filter((c) => c.analysis.logoPresent);
  const presenceRate = creatives.length > 0 ? withLogo.length / creatives.length : 0;

  const positions: string[] = [];
  for (const c of withLogo) {
    if (c.analysis.logoPosition) positions.push(c.analysis.logoPosition.toLowerCase().trim());
  }
  const posFreqs = frequencyCount(positions);
  const posEntries = topEntries(posFreqs, withLogo.length || 1);

  return {
    presenceRate,
    positions: posEntries.map((e) => ({ position: e.value, frequency: e.frequency })),
    preferredPosition: posEntries[0]?.value ?? null,
  };
}

export function detectInconsistencies(
  creatives: AnalyzedCreative[],
  colors: ClusteredColor[],
  typography: AggregatedTypography,
  layouts: AggregatedLayouts,
  copyPatterns: AggregatedCopyPatterns,
  imageTreatment: AggregatedImageTreatment,
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  // Color: no cluster with confidence "strong"
  if (colors.length > 0 && !colors.some((c) => c.confidence === 'strong')) {
    // Find creatives with most unique colors as examples
    const examples = creatives.slice(0, 3).map((c) => c.id);
    inconsistencies.push({
      dimension: 'color',
      severity: 'high',
      description: 'No color appears consistently across creatives. The brand lacks a unified color palette.',
      exampleCreativeIds: examples,
    });
  }

  // Typography: top font frequency < 0.4
  const topFont = typography.fonts[0];
  if (topFont && topFont.frequency < 0.4) {
    const deviating = creatives
      .filter((c) => {
        const font = topFont.role === 'heading'
          ? c.analysis.typography.headlineFont
          : c.analysis.typography.bodyFont;
        return font !== topFont.family;
      })
      .slice(0, 3)
      .map((c) => c.id);
    inconsistencies.push({
      dimension: 'typography',
      severity: 'medium',
      description: `Most common font "${topFont.family}" only appears in ${Math.round(topFont.frequency * 100)}% of creatives.`,
      exampleCreativeIds: deviating,
    });
  }

  // Layout: dominant < 0.3
  if (layouts.layouts[0] && layouts.layouts[0].frequency < 0.3) {
    const dominantType = layouts.dominantLayout;
    const deviating = creatives
      .filter((c) => c.analysis.layoutType.toLowerCase().trim() !== dominantType)
      .slice(0, 3)
      .map((c) => c.id);
    inconsistencies.push({
      dimension: 'layout',
      severity: 'medium',
      description: `No dominant layout pattern. Most common "${dominantType}" appears in only ${Math.round(layouts.layouts[0].frequency * 100)}% of creatives.`,
      exampleCreativeIds: deviating,
    });
  }

  // Tone: top tone < 0.4
  if (copyPatterns.tones[0] && copyPatterns.tones[0].frequency < 0.4) {
    const deviating = creatives
      .filter((c) => c.analysis.copy.tone.toLowerCase().trim() !== copyPatterns.dominantTone)
      .slice(0, 3)
      .map((c) => c.id);
    inconsistencies.push({
      dimension: 'tone',
      severity: 'medium',
      description: `Inconsistent messaging tone. Most common "${copyPatterns.dominantTone}" appears in only ${Math.round(copyPatterns.tones[0].frequency * 100)}% of creatives.`,
      exampleCreativeIds: deviating,
    });
  }

  // Image treatment: multiple styles > 30% each
  const majorStyles = imageTreatment.styles.filter((s) => s.frequency > 0.3);
  if (majorStyles.length > 1) {
    const deviating = creatives
      .filter((c) => c.analysis.imageTreatment.style.toLowerCase().trim() !== imageTreatment.dominantStyle)
      .slice(0, 3)
      .map((c) => c.id);
    inconsistencies.push({
      dimension: 'imageTreatment',
      severity: 'low',
      description: `Multiple image styles used significantly: ${majorStyles.map((s) => `"${s.style}" (${Math.round(s.frequency * 100)}%)`).join(', ')}.`,
      exampleCreativeIds: deviating,
    });
  }

  return inconsistencies;
}

/** Main aggregation entry point */
export function aggregateCreatives(creatives: AnalyzedCreative[]): AggregatedResult {
  // Filter out creatives missing required analysis data
  const valid = creatives.filter(
    (c) => c.colorAnalysis && c.analysis &&
           Array.isArray(c.colorAnalysis.colors) && c.colorAnalysis.colors.length > 0,
  );

  if (valid.length === 0) {
    return {
      colorPalette: [],
      typography: { fonts: [], fontSizes: [], fontWeights: [] },
      layoutStructures: { layouts: [], dominantLayout: 'unknown' },
      imageTreatment: { styles: [], dominantStyle: 'unknown', filterEffects: [], overlayUsageRate: 0 },
      copyPatterns: { tones: [], dominantTone: 'neutral', ctaTexts: [], structurePatterns: [] },
      logoUsage: { presenceRate: 0, positions: [], preferredPosition: null },
      inconsistencies: [],
    };
  }

  const colors = clusterColors(valid);
  const typo = aggregateTypography(valid);
  const layouts = analyzeLayouts(valid);
  const copy = analyzeCopyPatterns(valid);
  const image = analyzeImageTreatment(valid);
  const logo = analyzeLogoUsage(valid);
  const inconsistencies = detectInconsistencies(valid, colors, typo, layouts, copy, image);

  return {
    colorPalette: colors,
    typography: typo,
    layoutStructures: layouts,
    imageTreatment: image,
    copyPatterns: copy,
    logoUsage: logo,
    inconsistencies,
  };
}
