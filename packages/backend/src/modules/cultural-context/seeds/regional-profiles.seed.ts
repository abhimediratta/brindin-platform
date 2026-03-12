import 'dotenv/config';
import { db } from '../../../db/index.js';
import { regionalCreativeProfiles } from '../../../db/schema.js';
import type { CreateRegionalProfile } from '@brindin/shared';

const profiles: CreateRegionalProfile[] = [
  // ─── Tamil Nadu ────────────────────────────────────────────────────
  {
    regionCode: 'TN',
    regionName: 'Tamil Nadu',
    primaryLanguages: ['ta', 'en'],
    typographyStyle: {
      preferredWeight: 'bold',
      density: 'high',
      scriptAesthetics: 'Dramatic size contrast between headline and body; Tamil script rendered large with strong presence',
      displayPreference: 'display',
      notes: 'Tamil audiences respond to bold, confident typography. Thin fonts feel weak. Headlines should dominate the visual hierarchy.',
    },
    colorTendencies: {
      paletteType: 'jewel',
      preferredHues: ['red', 'gold', 'deep-blue', 'maroon', 'saffron'],
      saturationLevel: 'high',
      contrastPreference: 'high',
      festivalColors: {
        pongal: ['yellow', 'orange', 'green'],
        diwali: ['red', 'gold', 'purple'],
        navratri: ['red', 'yellow', 'green'],
      },
      avoidColors: [
        { color: 'pale-pink', reason: 'Perceived as weak/unserious in mass market' },
        { color: 'plain-white-background', reason: 'Feels empty; TN audiences expect visual richness' },
      ],
    },
    layoutDensity: {
      informationDensity: 'high',
      whitespaceTolerance: 'low',
      elementCountRange: { min: 5, max: 12 },
      priceProminence: 'dominant',
      ctaStyle: 'Large, bold, action-oriented with urgency words',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'witty',
      formality: 'medium',
      literaryInfluence: 'cinema-dialogue',
      emotionalRegister: ['pride', 'aspiration', 'family-honor', 'regional-identity'],
      hinglishAcceptance: 'low',
    },
    trustSignals: {
      primary: ['cinema-celebrity', 'awards', 'certifications', 'heritage-years'],
      secondary: ['family-endorsement', 'local-authority-figure'],
      format: ['testimonial-video', 'badge-display', 'celebrity-endorsement-card'],
    },
    visualGrammar: {
      motifs: ['kolam-patterns', 'temple-architecture', 'banana-leaf', 'silk-drapes'],
      photographyStyle: 'dramatic-lighting',
      illustrationPreference: 'detailed-traditional',
      modelRepresentation: 'regional-features',
      productPresentation: 'hero-shot',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Hindi-first with Tamil subtitle', reason: 'Feels like afterthought; Tamil audience expects Tamil-first' },
        { pattern: 'Minimalist white-space design', reason: 'Perceived as incomplete or low-effort in mass market' },
        { pattern: 'North Indian celebrity endorsement', reason: 'Low trust; regional cinema stars vastly outperform' },
        { pattern: 'Generic pan-India imagery', reason: 'TN audience has strong regional identity; generic feels foreign' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'double-meaning', 'rhyme'],
      alliteration: true,
      poetryForms: ['couplet', 'thirukkural-style'],
      memeFormats: ['cinema-dialogue-remix', 'superstar-reference', 'vadivelu-template'],
      idioms: ['சும்மா இருக்க முடியாது', 'கலக்குறான்'],
      scriptMixing: 'Tamil+English natural, but Tamil must dominate',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── West Bengal ───────────────────────────────────────────────────
  {
    regionCode: 'WB',
    regionName: 'West Bengal',
    primaryLanguages: ['bn', 'en'],
    typographyStyle: {
      preferredWeight: 'medium',
      density: 'medium',
      scriptAesthetics: 'Elegant Bangla script with literary flourishes; values typographic refinement over brute impact',
      displayPreference: 'serif',
      notes: 'Bengal values literary aesthetic. Bold-shouty typography feels crass. Refinement and wit preferred over volume.',
    },
    colorTendencies: {
      paletteType: 'earthy',
      preferredHues: ['terracotta', 'ochre', 'deep-green', 'off-white', 'mustard'],
      saturationLevel: 'medium',
      contrastPreference: 'medium',
      festivalColors: {
        durga_puja: ['red', 'white', 'gold'],
        poila_baisakh: ['red', 'white'],
        saraswati_puja: ['yellow', 'white'],
      },
      avoidColors: [
        { color: 'neon-anything', reason: 'Perceived as garish; conflicts with Bengali aesthetic sensibility' },
      ],
    },
    layoutDensity: {
      informationDensity: 'medium',
      whitespaceTolerance: 'high',
      elementCountRange: { min: 3, max: 8 },
      priceProminence: 'subtle',
      ctaStyle: 'Understated, intellectually appealing rather than urgency-driven',
    },
    copyTone: {
      register: 'literary',
      humorNorm: 'witty',
      formality: 'medium',
      literaryInfluence: 'poetry-influenced',
      emotionalRegister: ['intellectual-pride', 'nostalgia', 'cultural-refinement', 'artistic-sensibility'],
      hinglishAcceptance: 'low',
    },
    trustSignals: {
      primary: ['cultural-endorsement', 'literary-reference', 'heritage-brand'],
      secondary: ['intellectual-authority', 'artistic-community-approval'],
      format: ['quote-card', 'editorial-style', 'cultural-narrative'],
    },
    visualGrammar: {
      motifs: ['alpona-patterns', 'terracotta-art', 'dhak-drum', 'howrah-bridge'],
      photographyStyle: 'natural-warm',
      illustrationPreference: 'artistic-hand-drawn',
      modelRepresentation: 'regional-features',
      productPresentation: 'in-use-lifestyle',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Loud, aggressive sales copy', reason: 'Feels culturally tone-deaf; Bengal prefers wit over volume' },
        { pattern: 'Bollywood celebrity endorsement', reason: 'Bengali audience values own cultural icons over Hindi film stars' },
        { pattern: 'Over-saturated neon colors', reason: 'Conflicts with refined Bengali aesthetic sensibility' },
        { pattern: 'Price-dominant layout', reason: 'Feels cheap; Bengal audience responds to value narrative over price shout' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'literary-allusion', 'double-entendre'],
      alliteration: false,
      poetryForms: ['couplet', 'rhyming-verse', 'rabindra-style'],
      memeFormats: ['feluda-reference', 'bhadralok-humor', 'bengali-cinema-dialogue'],
      idioms: ['একেবারে ফাটাফাটি', 'মাছে-ভাতে বাঙালি'],
      scriptMixing: 'Pure Bangla preferred; English acceptable in metro contexts',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── Punjab ────────────────────────────────────────────────────────
  {
    regionCode: 'PB',
    regionName: 'Punjab',
    primaryLanguages: ['pa', 'hi', 'en'],
    typographyStyle: {
      preferredWeight: 'bold',
      density: 'high',
      scriptAesthetics: 'Strong, confident Gurmukhi or Devanagari; unapologetically big headlines',
      displayPreference: 'sans-serif',
      notes: 'Punjab loves bold, celebratory typography. Understated feels underwhelming. Energy and confidence in every element.',
    },
    colorTendencies: {
      paletteType: 'vibrant',
      preferredHues: ['bright-yellow', 'orange', 'red', 'green', 'hot-pink'],
      saturationLevel: 'high',
      contrastPreference: 'high',
      festivalColors: {
        baisakhi: ['yellow', 'orange', 'green'],
        lohri: ['red', 'orange', 'gold'],
        diwali: ['gold', 'red', 'purple'],
      },
      avoidColors: [
        { color: 'muted-pastels', reason: 'Feels lifeless; Punjab expects celebration and energy in visuals' },
      ],
    },
    layoutDensity: {
      informationDensity: 'high',
      whitespaceTolerance: 'low',
      elementCountRange: { min: 5, max: 10 },
      priceProminence: 'prominent',
      ctaStyle: 'Big, bold, action-oriented with warmth',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'slapstick',
      formality: 'low',
      literaryInfluence: 'folk-music-bhangra',
      emotionalRegister: ['family-warmth', 'celebration', 'abundance', 'pride', 'generosity'],
      hinglishAcceptance: 'high',
    },
    trustSignals: {
      primary: ['family-validation', 'community-endorsement', 'abundance-proof'],
      secondary: ['celebrity-cricketer', 'punjabi-music-star'],
      format: ['family-testimonial', 'before-after', 'community-gathering-shot'],
    },
    visualGrammar: {
      motifs: ['wheat-fields', 'phulkari-embroidery', 'tractor', 'lassi-glass'],
      photographyStyle: 'bright-warm-natural',
      illustrationPreference: 'modern-flat',
      modelRepresentation: 'family-groups',
      productPresentation: 'in-use-lifestyle',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Minimalist sparse design', reason: 'Feels cold and unwelcoming; Punjab expects warmth and abundance' },
        { pattern: 'Formal corporate tone', reason: 'Feels distant; Punjab responds to warmth and familiarity' },
        { pattern: 'Individual-centric messaging', reason: 'Family and community matter more than individual identity' },
      ],
    },
    languageDevices: {
      wordplayType: ['rhyme', 'folk-saying', 'pun'],
      alliteration: false,
      poetryForms: ['folk-verse', 'bhangra-lyric'],
      memeFormats: ['punjabi-music-video-reference', 'sardar-ji-pride', 'diljit-template'],
      idioms: ['ਬੱਲੇ ਬੱਲੇ', 'ਚੱਕ ਦੇ ਫੱਟੇ'],
      scriptMixing: 'Punjabi+Hindi+English all natural; code-switching expected',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── Kerala ────────────────────────────────────────────────────────
  {
    regionCode: 'KL',
    regionName: 'Kerala',
    primaryLanguages: ['ml', 'en'],
    typographyStyle: {
      preferredWeight: 'medium',
      density: 'medium',
      scriptAesthetics: 'Rounded Malayalam script with clarity emphasis; clean and readable over decorative',
      displayPreference: 'sans-serif',
      notes: 'Kerala has highest literacy in India. Audiences read carefully. Clean, well-set typography respected over flashy display.',
    },
    colorTendencies: {
      paletteType: 'earthy',
      preferredHues: ['green', 'white', 'gold', 'cream', 'deep-red'],
      saturationLevel: 'medium',
      contrastPreference: 'medium',
      festivalColors: {
        onam: ['yellow', 'gold', 'cream', 'green'],
        vishu: ['yellow', 'gold'],
      },
      avoidColors: [
        { color: 'garish-neon', reason: 'Perceived as unsophisticated; clashes with Kerala aesthetic restraint' },
      ],
    },
    layoutDensity: {
      informationDensity: 'medium',
      whitespaceTolerance: 'high',
      elementCountRange: { min: 3, max: 7 },
      priceProminence: 'prominent',
      ctaStyle: 'Clear, informative, education-oriented',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'witty',
      formality: 'medium',
      literaryInfluence: 'literary-journalism',
      emotionalRegister: ['education-pride', 'practical-wisdom', 'family-welfare', 'social-consciousness'],
      hinglishAcceptance: 'none',
    },
    trustSignals: {
      primary: ['education-credentials', 'expert-endorsement', 'quality-certification'],
      secondary: ['community-cooperative', 'government-recognition'],
      format: ['expert-quote', 'certification-badge', 'comparison-chart'],
    },
    visualGrammar: {
      motifs: ['backwaters', 'coconut-palm', 'kathakali-elements', 'mundu-drape'],
      photographyStyle: 'natural-warm',
      illustrationPreference: 'minimal',
      modelRepresentation: 'regional-features',
      productPresentation: 'in-use-lifestyle',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Hindi-first communication', reason: 'Strong Malayalam pride; Hindi feels like imposition' },
        { pattern: 'Flashy oversaturated design', reason: 'Perceived as low-quality; Kerala prefers restrained sophistication' },
        { pattern: 'Celebrity-worship format', reason: 'Kerala audience values substance and credentials over star power' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'satire', 'literary-reference'],
      alliteration: false,
      poetryForms: ['proverb', 'folk-saying'],
      memeFormats: ['malayalam-cinema-dialogue', 'political-satire', 'troll-malayalam'],
      idioms: ['അടിപൊളി', 'കിടിലൻ'],
      scriptMixing: 'Pure Malayalam strongly preferred; English technical terms acceptable',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── Maharashtra ───────────────────────────────────────────────────
  {
    regionCode: 'MH',
    regionName: 'Maharashtra',
    primaryLanguages: ['mr', 'hi', 'en'],
    typographyStyle: {
      preferredWeight: 'bold',
      density: 'high',
      scriptAesthetics: 'Strong Devanagari with modern treatment; confident but not flashy',
      displayPreference: 'sans-serif',
      notes: 'Maharashtra appreciates clear, confident typography. Balances between dramatic and practical. Marathi script must be well-rendered.',
    },
    colorTendencies: {
      paletteType: 'warm',
      preferredHues: ['saffron', 'orange', 'green', 'maroon', 'gold'],
      saturationLevel: 'medium',
      contrastPreference: 'high',
      festivalColors: {
        ganesh_chaturthi: ['red', 'orange', 'gold', 'green'],
        gudi_padwa: ['saffron', 'gold', 'green'],
        diwali: ['red', 'gold', 'purple'],
      },
      avoidColors: [
        { color: 'pale-pastels-only', reason: 'Can feel unsubstantial for mass Marathi audience' },
      ],
    },
    layoutDensity: {
      informationDensity: 'high',
      whitespaceTolerance: 'medium',
      elementCountRange: { min: 4, max: 10 },
      priceProminence: 'prominent',
      ctaStyle: 'Direct, value-focused, practical',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'witty',
      formality: 'medium',
      literaryInfluence: 'theatre-influenced',
      emotionalRegister: ['pride', 'practicality', 'value-consciousness', 'marathi-identity'],
      hinglishAcceptance: 'medium',
    },
    trustSignals: {
      primary: ['value-proof', 'heritage-brand', 'marathi-celebrity'],
      secondary: ['community-endorsement', 'quality-certification'],
      format: ['comparison-chart', 'testimonial', 'value-proposition-card'],
    },
    visualGrammar: {
      motifs: ['warli-art', 'paithani-border', 'shivaji-references', 'vada-pav-culture'],
      photographyStyle: 'studio-clean',
      illustrationPreference: 'modern-flat',
      modelRepresentation: 'diverse',
      productPresentation: 'hero-shot',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Only Hindi without Marathi option', reason: 'Strong Marathi pride; feels like erasure' },
        { pattern: 'Premium-only positioning', reason: 'Maharashtra is value-conscious; must justify price with substance' },
        { pattern: 'Generic North Indian framing', reason: 'Maharashtra has distinct identity; resents being clubbed with Hindi belt' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'rhyme', 'folk-reference'],
      alliteration: false,
      poetryForms: ['abhang', 'ovi', 'powada-style'],
      memeFormats: ['marathi-manus-pride', 'mumbai-local-humor', 'natsamrat-dialogue'],
      idioms: ['एकदम झक्कास', 'भारी'],
      scriptMixing: 'Marathi+Hindi+English all acceptable; Marathi-first preferred outside Mumbai',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── Karnataka ─────────────────────────────────────────────────────
  {
    regionCode: 'KA',
    regionName: 'Karnataka',
    primaryLanguages: ['kn', 'en'],
    typographyStyle: {
      preferredWeight: 'medium',
      density: 'medium',
      scriptAesthetics: 'Rounded Kannada script; blend of traditional and tech-modern aesthetics',
      displayPreference: 'sans-serif',
      notes: 'Karnataka bridges traditional and tech. Bangalore metro accepts modern minimal, but rest of state values traditional warmth.',
    },
    colorTendencies: {
      paletteType: 'warm',
      preferredHues: ['red', 'gold', 'sandalwood', 'green', 'cream'],
      saturationLevel: 'medium',
      contrastPreference: 'medium',
      festivalColors: {
        dasara: ['red', 'gold', 'green'],
        ugadi: ['yellow', 'green', 'red'],
      },
      avoidColors: [
        { color: 'cold-blue-only', reason: 'Feels too corporate-Western for non-metro Karnataka audience' },
      ],
    },
    layoutDensity: {
      informationDensity: 'medium',
      whitespaceTolerance: 'medium',
      elementCountRange: { min: 4, max: 9 },
      priceProminence: 'prominent',
      ctaStyle: 'Clear, balanced between modern and traditional appeal',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'subtle',
      formality: 'medium',
      literaryInfluence: 'folk-and-tech-blend',
      emotionalRegister: ['kannada-pride', 'tech-aspiration', 'heritage-respect', 'family-values'],
      hinglishAcceptance: 'medium',
    },
    trustSignals: {
      primary: ['quality-certification', 'tech-credibility', 'kannada-celebrity'],
      secondary: ['heritage-brand', 'local-business-trust'],
      format: ['certification-badge', 'expert-endorsement', 'testimonial'],
    },
    visualGrammar: {
      motifs: ['mysore-palace', 'sandalwood', 'yakshagana-elements', 'coffee-plantation'],
      photographyStyle: 'natural-warm',
      illustrationPreference: 'modern-flat',
      modelRepresentation: 'regional-features',
      productPresentation: 'in-use-lifestyle',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Hindi-dominant communication', reason: 'Strong Kannada identity; Hindi feels like imposition outside Bangalore' },
        { pattern: 'Pure Western-minimal aesthetic', reason: 'Works in Bangalore metro but alienates rest of Karnataka' },
        { pattern: 'Ignoring Kannada script', reason: 'Even tech audience values Kannada representation' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'folk-reference'],
      alliteration: false,
      poetryForms: ['vachana-style', 'folk-verse'],
      memeFormats: ['kannada-cinema-dialogue', 'raj-kumar-reference', 'bangalore-vs-bengaluru'],
      idioms: ['ಮಸ್ತ್', 'ಸೂಪರ್ ಆಗಿದೆ'],
      scriptMixing: 'Kannada+English natural in Bangalore; Kannada-first elsewhere',
    },
    confidenceTier: 1,
    source: 'ai-drafted-v1',
  },

  // ─── Gujarat ───────────────────────────────────────────────────────
  {
    regionCode: 'GJ',
    regionName: 'Gujarat',
    primaryLanguages: ['gu', 'hi', 'en'],
    typographyStyle: {
      preferredWeight: 'bold',
      density: 'high',
      scriptAesthetics: 'Clean Gujarati script; commercial-friendly, readable over artistic',
      displayPreference: 'sans-serif',
      notes: 'Gujarat is business-minded. Typography should be clear, confident, and commercial. Information-dense layouts work well.',
    },
    colorTendencies: {
      paletteType: 'vibrant',
      preferredHues: ['red', 'gold', 'bright-green', 'orange', 'hot-pink'],
      saturationLevel: 'high',
      contrastPreference: 'high',
      festivalColors: {
        navratri: ['red', 'orange', 'hot-pink', 'green', 'blue'],
        uttarayan: ['multicolor', 'bright-yellow', 'red'],
        diwali: ['gold', 'red', 'green'],
      },
      avoidColors: [
        { color: 'dull-muted-palette', reason: 'Gujarat expects festive energy; muted feels lifeless' },
      ],
    },
    layoutDensity: {
      informationDensity: 'high',
      whitespaceTolerance: 'low',
      elementCountRange: { min: 6, max: 12 },
      priceProminence: 'dominant',
      ctaStyle: 'Deal-oriented, value-driven, urgency-focused',
    },
    copyTone: {
      register: 'conversational',
      humorNorm: 'witty',
      formality: 'low',
      literaryInfluence: 'business-commerce',
      emotionalRegister: ['business-savvy', 'value-consciousness', 'family-prosperity', 'festive-joy'],
      hinglishAcceptance: 'high',
    },
    trustSignals: {
      primary: ['value-proof', 'deal-comparison', 'business-community-endorsement'],
      secondary: ['family-business-heritage', 'gujarati-celebrity'],
      format: ['price-comparison', 'deal-card', 'family-testimonial'],
    },
    visualGrammar: {
      motifs: ['bandhani-patterns', 'garba-dancers', 'dandiya-sticks', 'diamond-motif'],
      photographyStyle: 'bright-commercial',
      illustrationPreference: 'modern-flat',
      modelRepresentation: 'family-groups',
      productPresentation: 'hero-shot',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Premium-without-value narrative', reason: 'Gujarat wants to know the deal; premium must be justified' },
        { pattern: 'Sparse minimalist design', reason: 'Feels like information is being hidden; Gujarat wants all details upfront' },
        { pattern: 'Emotional-only messaging', reason: 'Must include practical value proposition; Gujarat is business-minded' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'business-metaphor', 'rhyme'],
      alliteration: false,
      poetryForms: ['folk-doha', 'garba-lyric'],
      memeFormats: ['gujju-business-humor', 'dhokla-fafda-reference', 'navratri-meme'],
      idioms: ['મજા આવી ગઈ', 'એકદમ ફાઇન'],
      scriptMixing: 'Gujarati+Hindi+English freely mixed; Gujarati-first for non-metro',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },

  // ─── Delhi-NCR ─────────────────────────────────────────────────────
  {
    regionCode: 'DL',
    regionName: 'Delhi-NCR',
    primaryLanguages: ['hi', 'en'],
    typographyStyle: {
      preferredWeight: 'bold',
      density: 'medium',
      scriptAesthetics: 'Modern Devanagari or English; trend-forward, metro-aspirational',
      displayPreference: 'sans-serif',
      notes: 'Delhi is trend-conscious. Typography should feel current and confident. Accepts both Hindi and English naturally.',
    },
    colorTendencies: {
      paletteType: 'vibrant',
      preferredHues: ['black', 'gold', 'red', 'royal-blue', 'white'],
      saturationLevel: 'high',
      contrastPreference: 'high',
      festivalColors: {
        diwali: ['gold', 'red', 'purple'],
        holi: ['multicolor', 'pink', 'yellow', 'green'],
        karva_chauth: ['red', 'gold'],
      },
      avoidColors: [
        { color: 'overly-rustic-palette', reason: 'Delhi audience is metro-aspirational; rustic feels backward' },
      ],
    },
    layoutDensity: {
      informationDensity: 'medium',
      whitespaceTolerance: 'medium',
      elementCountRange: { min: 4, max: 9 },
      priceProminence: 'prominent',
      ctaStyle: 'Trend-forward, FOMO-driven, aspirational',
    },
    copyTone: {
      register: 'casual',
      humorNorm: 'witty',
      formality: 'low',
      literaryInfluence: 'street-culture-bollywood',
      emotionalRegister: ['aspiration', 'trend-consciousness', 'status', 'FOMO', 'urban-cool'],
      hinglishAcceptance: 'high',
    },
    trustSignals: {
      primary: ['bollywood-celebrity', 'trend-validation', 'social-proof'],
      secondary: ['influencer-endorsement', 'brand-name-recognition'],
      format: ['influencer-style', 'social-proof-counter', 'trend-alert'],
    },
    visualGrammar: {
      motifs: ['metro-cityscape', 'street-food-culture', 'modern-architecture', 'auto-rickshaw'],
      photographyStyle: 'studio-clean',
      illustrationPreference: 'modern-flat',
      modelRepresentation: 'diverse',
      productPresentation: 'flat-lay',
    },
    whatFails: {
      antiPatterns: [
        { pattern: 'Overly traditional/conservative design', reason: 'Delhi is cosmopolitan; overly traditional feels dated' },
        { pattern: 'Single-language rigid approach', reason: 'Delhi naturally code-switches; rigid language feels unnatural' },
        { pattern: 'Regional-specific cultural references', reason: 'Delhi is a melting pot; narrow regional references exclude large segments' },
      ],
    },
    languageDevices: {
      wordplayType: ['pun', 'hinglish-wordplay', 'slang-reference'],
      alliteration: false,
      poetryForms: ['shayari', 'bollywood-lyric'],
      memeFormats: ['delhi-metro-humor', 'bollywood-dialogue', 'street-food-reference'],
      idioms: ['एकदम झकास', 'पैसा वसूल', 'फुल पैसा वसूल'],
      scriptMixing: 'Hindi+English completely natural; Hinglish is default register',
    },
    confidenceTier: 2,
    source: 'ai-drafted-v1',
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding regional creative profiles...');

  for (const profile of profiles) {
    const [result] = await db
      .insert(regionalCreativeProfiles)
      .values({
        regionCode: profile.regionCode,
        regionName: profile.regionName,
        primaryLanguages: profile.primaryLanguages,
        typographyStyle: profile.typographyStyle,
        colorTendencies: profile.colorTendencies,
        layoutDensity: profile.layoutDensity,
        copyTone: profile.copyTone,
        trustSignals: profile.trustSignals,
        visualGrammar: profile.visualGrammar,
        whatFails: profile.whatFails ?? null,
        languageDevices: profile.languageDevices ?? null,
        confidenceTier: profile.confidenceTier,
        source: profile.source,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: regionalCreativeProfiles.regionCode,
        set: {
          regionName: profile.regionName,
          primaryLanguages: profile.primaryLanguages,
          typographyStyle: profile.typographyStyle,
          colorTendencies: profile.colorTendencies,
          layoutDensity: profile.layoutDensity,
          copyTone: profile.copyTone,
          trustSignals: profile.trustSignals,
          visualGrammar: profile.visualGrammar,
          whatFails: profile.whatFails ?? null,
          languageDevices: profile.languageDevices ?? null,
          confidenceTier: profile.confidenceTier,
          source: profile.source,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    console.log(`  ✓ ${result.regionCode} — ${result.regionName}`);
  }

  console.log(`\nDone. ${profiles.length} profiles seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
