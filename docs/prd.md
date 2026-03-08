# Product Requirements Document

## Market Intelligence and Creative Production Platform for Indian Markets

---

## 1. Executive Summary

This product is a market intelligence and creative production platform purpose-built for the Indian advertising ecosystem. It gives agencies and D2C brands the ability to scale creative output across India's fragmented markets — without proportionally scaling headcount. The platform extracts brand design systems from existing creative work, uses them to power AI-assisted creative generation within structured brand constraints, and embeds India-specific market intelligence (regional, cultural, linguistic, tier-based) directly into the production workflow so that every creative is on-brand, market-appropriate, and performance-informed — without the team needing to think about the intelligence layer.

**Core value proposition:** Scale your agency's creative output 3x without 3x the headcount — powered by codified brand systems and embedded market intelligence.

**Target users:** Indian performance marketing agencies (primary) and D2C brands scaling beyond metros (secondary).

No existing product combines brand design system extraction + Indian market intelligence + creative generation constrained by both. Each incumbent solves one piece. The integration is the product.

---

## 2. Problem Statement

Indian agencies hit a production scaling wall. They can service 10-15 brands with senior talent and hands-on oversight, but growth beyond that degrades quality, burns out key people, and leaves revenue on the table — because creative production, brand knowledge, and market adaptation all depend on people who don't scale.

This produces five measurable failures:

### 2.1 Knowledge Fragility

Agency knowledge lives in people's heads. With 30-40% annual attrition in mid-level roles, every departure is a data loss event.

- **Impact:** 4-8 weeks of degraded campaign performance per key team transition, per brand.
- **Scale:** Agencies managing 10+ brands experience this continuously.

The Brand Design System is the strongest knowledge-retention feature here — it captures the formalized visual and messaging identity that straddles market knowledge, client context, and operational knowledge. When a designer leaves, the design system stays.

### 2.2 Regional Guesswork

No structured system exists to answer basic regional questions: what creative style works for this category in this region? What price framing? Which language register? What did we learn from similar campaigns?

- **Impact:** Launching in unfamiliar regions involves uncertainty and avoidable mistakes — wrong language, wrong cultural references, wrong price anchoring.
- **Scale:** For a brand spending Rs.5L/month on ads, initial regional campaigns carry meaningful waste from learning spend.

The valuable regional intelligence isn't reports about what works. It's intelligence **embedded in creative production** — the system automatically adapts copy tone, price framing, visual style, and language register when you select a target region. Agencies don't want to read about regional differences; they want creatives that already account for them.

### 2.3 Client Trust Deficit

Agencies can't demonstrate structured, evidence-based reasoning for creative and targeting decisions. They dress up intuition with a few data points. Clients know it.

- **Impact:** Client retention averages 8-14 months.

This is a secondary pain — poor ROAS and relationship breakdowns cause more churn than "not understanding the audience." But evidence-backed capabilities matter at two high-stakes moments:

1. **Surviving performance dips.** Every campaign has bad weeks. The agency that can say "Our data suggests this happened because of X, and here's the adjustment we're making based on Y" retains clients through rough patches. The agency that says "let's try some new creatives and see" gets fired during the same dip.
2. **Winning new client pitches.** An agency that can demonstrate "here's our structured approach to entering Tier 2 markets in your category, based on intelligence from 200 campaigns" wins pitches against larger competitors.

These moments are infrequent but high-stakes — worth solving, just not worth positioning as the core value prop.

### 2.4 The Scaling Ceiling

Agencies dependent on individual expertise can't scale. Every new brand requires a senior person who "knows" the market, a designer who "knows" the brand, and a manager who "knows" the client. Growth is bottlenecked by people, not systems.

- **Impact:** Most Indian performance marketing agencies plateau at 15-25 clients. Revenue left on the table.

**Where the ceiling hits:**

| Bottleneck | Why it limits scale | What solves it |
|---|---|---|
| Creative production | Each brand needs 30-100 creatives/month. 20 brands = 600-2000/month. Need 5-10 designers. | AI creative generation within brand systems |
| Account management | Each AM handles 3-8 brands. Quality drops above 5. | Structured briefing, templated workflows |
| Quality control | Founder can review every creative for 10 brands. Not 20+. | Design system compliance checking |
| Knowledge concentration | Founder/senior strategist is the brain for all brands. | Codified intelligence, design systems |

Every feature in this platform should be evaluated against this question: *does it help an agency support more brands without proportionally more senior headcount?*

**The production math:**
- Agency with 15 brands, each needs 40-80 creatives/month
- Total: 600-1200 creatives/month
- A good designer produces 8-12 finished creatives/day
- That's 50-100 working days of designer output per month
- With 22 working days/month, you need 3-5 full-time designers
- Designer salaries: Rs.25-50K each = Rs.75K-2.5L/month just for creative production
- Plus creative director review time, revision cycles, quality issues

**Why agencies would pay for this first:**
- Directly replaces or augments headcount (clear ROI)
- Used daily (high engagement = high retention)
- Creates switching costs (creatives are produced through the platform)
- Tangible output (not reports or insights — actual ads)

### 2.5 Creative Guidelines Vacuum

Small Indian D2C brands have no real design system — a logo, a color or two, a vague sense of vibe. Agencies inherit this vacuum and fill it ad-hoc. Junior designers (who produce 80% of the volume) guess, get rejected, guess again.

- **Impact:** Creative inconsistency across campaigns. Impossible to scale production. Regional adaptation becomes reinvention. Agency switching destroys continuity. And critically: AI creative tools can't produce consistent output without structured inputs.

**The hidden cost math:**
- Average revision cycle: 45 minutes (designer rework + AM review + client back-and-forth)
- Revisions due to brand inconsistency: ~30% of creatives
- For 15 brands x 50 creatives/month x 30% revision rate x 45 min = 168 hours/month
- At Rs.300/hour blended cost = Rs.50,000/month in hidden waste

The Design System Builder's real value is not the document — it's what it enables: junior designers produce on-brand work on the first attempt, new designers onboard in days instead of weeks, and creative generation AI has structured constraints to work within.

### Why India-Specific

This problem is structurally unique to India's market:

- **Linguistic fragmentation:** 22 scheduled languages, each with distinct advertising norms. Hindi in UP is different from Hindi in Rajasthan.
- **The tier system:** Metro / Tier 1 / Tier 2 / Tier 3 represent fundamentally different consumer psychologies, not just city sizes.
- **Festival calendar as commercial engine:** 30+ commercially significant festivals, distributed unevenly across regions. Each with specific emotional tones, visual languages, and purchase patterns.
- **Platform fragmentation beyond Meta/Google:** ShareChat/Moj dominates Tier 2/3 Hindi markets. Platform priority varies by geography.
- **D2C explosion:** 800+ funded D2C brands, thousands bootstrapped, most trying to expand beyond metros.

No global tool has solved this because no global tool is built around this structure.

---

## 3. Competitive Landscape

Several companies occupy adjacent territory. Understanding why they haven't solved this problem clarifies what we're actually building.

**Global AI creative tools (AdCreative.ai, Pencil, Creatopy):** These generate ad creatives from templates and generic best practices. They know nothing about Indian regional dynamics, festival contexts, or tier-based consumer psychology. Adding Hindi language support doesn't make them India-intelligent. Their limitation isn't technical — it's that their intelligence layer has no Indian market depth.

**Indian AdTech platforms (Pixis AI, factors.ai):** Pixis does AI-driven campaign optimization — bidding, targeting, budget allocation. It operates downstream of the creative and strategic decisions we're addressing. It optimizes _how_ ads are delivered, not _what_ ads should say or look like for a specific Indian market. Factors.ai focuses on attribution and analytics. Neither addresses the creative intelligence or brand systems problem.

**Creative management tools (Canva, Figma, Adobe):** These are creation tools, not intelligence tools. Canva's AI can generate a creative, but it doesn't know that your brand uses warm tones, that Tier 2 Gujarat responds to Gujarati copy with dandiya motifs during Navratri, or that your last 40 campaigns in this segment performed best with large text overlays. They're general-purpose instruments that require the user to bring all the strategic and brand context.

**DAMs and workflow tools (Air, Brandfolder, Frontify):** These store and organize assets. Some offer basic brand guideline functionality. None extract design systems from existing work, none connect brand systems to market intelligence, none generate creatives within those systems. They're filing cabinets, not strategists.

**Agency knowledge platforms (internal wikis, Notion, Google Drive):** Many agencies have tried to build internal knowledge bases about "what works where." These invariably decay within months because maintaining unstructured documentation is nobody's job. The knowledge needs to be a byproduct of the work, not a separate documentation effort — which is exactly what a platform that ingests campaign data and learns from it achieves.

**The gap:** No product combines brand design system extraction + Indian market intelligence + creative generation constrained by both. Each incumbent solves one piece. The integration is the product.

---

## 4. User Personas

### 4.1 Agency Account Manager / Strategist

**Role:** Owns the brand relationship. Responsible for strategy, briefs, and client communication.

**Current pain:**
- Can't support 5-8+ brands without quality degradation — each brand demands context, strategy, and oversight that doesn't scale with junior hires alone.
- Spends 3-5 hours per brand compiling regional insights from scattered sources and team knowledge before writing a brief.
- Can't demonstrate evidence-based reasoning to clients; relies on intuition dressed up with dashboard screenshots.
- When a team member leaves, spends weeks rebuilding context on the brand's regional performance.

**What they need from the platform:**
- Campaign briefing that synthesizes brand context + market intelligence into specific, evidence-backed creative direction.
- Client-facing outputs that demonstrate structured thinking (not generic decks to heavily edit).
- Institutional memory that persists through team changes.

**Success looks like:** Writing a campaign brief in 30 minutes instead of 3 hours, with evidence the client finds credible.

### 4.2 Agency Media Buyer

**Role:** Executes campaigns. Makes tactical decisions about targeting, budgets, and creative rotation.

**Current pain:**
- Enters new regions with no structured knowledge of what works there.
- Burns initial budget on "learning spend" that better upfront intelligence would reduce.
- Can't transfer learnings from one brand to another systematically, even within the same category and region.

**What they need from the platform:**
- Regional intelligence: platform mix, expected CPMs/CPAs, creative styles that perform, language preferences — before launching.
- Creative evaluation that catches mismatches between creative and target market before spend is wasted.
- Cross-brand pattern visibility (anonymized): what's working for similar brands in similar markets.

**Success looks like:** Launching in a new Tier 2 city with a meaningful reduction in learning spend.

### 4.3 Agency Creative / Designer

**Role:** Produces ad creatives. Often the person who de facto defines a brand's visual identity through what they make.

**Current pain:**
- Can't scale production from 20 to 100 creatives/month without quality collapsing — the volume pressure is the first thing designers feel.
- No brand guidelines to work from for most small D2C clients. Establishes the "look" through repetition, not intention.
- Regional adaptations are time-consuming reinventions because no system defines what changes across regions.

**What they need from the platform:**
- AI-generated creative drafts that are "80% done" — on-brand starting points they can finish in 15 minutes.
- A structured brand design system that defines visual rules, so they're refining within constraints instead of inventing from scratch.
- Regional variant rules that specify what changes (language, colors, motifs, price framing) per geography.

**Success looks like:** Producing 3x the creative output at consistent quality, spending time on refinement instead of setup.

### 4.4 D2C Brand Manager (Client-Side)

**Role:** Manages the brand's relationship with the agency. Approves briefs, reviews creatives, reports to leadership.

**Current pain:**
- Knows the brief saying "women 22-35, SEC A/B, urban" covers 80 million people across 15 distinct markets, but has no better framework.
- Can't evaluate whether the agency truly understands regional nuances or is guessing.
- No visibility into why creative decisions were made — only post-hoc performance dashboards.
- Needs faster creative turnaround from the agency — campaigns stall waiting for assets.

**What they need from the platform:**
- Evidence-backed briefs that show the agency's reasoning, not just their conclusions.
- Creative evaluation that explains why a creative is appropriate for a specific market.
- Reports that contextualize performance with strategic insight ("this worked in Gujarat because..."), not just numbers.

**Success looks like:** Confidence that the agency's regional strategy is evidence-based, not intuition-based — and faster time-to-market on campaigns.

### 4.5 D2C Founder (Self-Serve)

**Role:** Running a small brand (Rs.5-50L/month ad spend), often without a full-service agency. May have a freelance designer or small in-house team.

**Current pain:**
- Has no brand guidelines — just a logo and a Canva template.
- Can't afford a brand strategist or design director to create a proper design system.
- Needs to scale creative production for new regions and platforms but has no system to maintain consistency.
- Evaluating creative quality is subjective — no structured framework.

**What they need from the platform:**
- A brand design system extracted from their existing work, giving them structure they've never had.
- Creative generation that produces on-brand variants without a designer for every iteration.
- Market intelligence for expansion decisions: where to go next, what to adapt.

**Success looks like:** Going from "we like this shade of blue" to a documented design system and consistent creative output — in a single onboarding session.

---

## 5. Product Overview

### Platform Layers

The product operates across four interconnected layers that form a closed loop from brand understanding through creative output and back.

**Layer 1: Brand & Market Context (The Foundation)**
When an agency onboards a brand, the platform builds a structured profile from data the agency already has: ad accounts, past creatives, briefs, e-commerce analytics. The Brand Design System lives here — the formalized visual and messaging identity extracted from a brand's existing creative work. This is the entry point: it delivers value before the agency commits to anything else, and it's the prerequisite that makes everything downstream work.

**Layer 2: Market Intelligence Engine (The Brain)**
Structured knowledge about Indian markets along five dimensions: Geographic Intelligence (languages, platforms, costs, culture per market), Category Intelligence (what works for beauty vs. fintech vs. fashion), Cultural Intelligence (festivals, sensitivities, language nuance), Creative Pattern Intelligence (visual and copy patterns that correlate with performance), and Audience Segment Models (richer models like "aspirational Tier 2 young professional" with documented behavioral characteristics and creative preferences backed by performance data). This is not infrastructure — it is a core layer that provides the strategic depth no other tool offers. Initially curated manually from public sources; enriched as agencies use the platform.

**Layer 3: Decision Support (The Interface)**
Intelligence surfaces through specific, high-value workflows. MVP: Campaign Briefing Assistant (structured briefs with evidence-backed recommendations) and Creative Evaluation (pre-launch assessment against brand guidelines and cultural sensitivity). Post-MVP: Regional Expansion Planner, Strategic Reporting, and Competitive Intelligence. Each workflow combines brand context from Layer 1 with market intelligence from Layer 2 to produce actionable, evidence-backed outputs.

**Layer 4: Creative Generation (The Output)**
Where the Brand Design System provides visual rules, Market Intelligence provides strategic direction, and they converge to enable what no standalone AI creative tool can do: generate ad creatives that are simultaneously on-brand, market-appropriate, and performance-informed. The Regional Adaptation Engine is the differentiated capability — one master brief, adapted versions per region, automatically applying the right language, cultural references, price framing, and visual adaptations.

### The Flywheel

These layers form a closed loop that compounds with use:

```
Brand onboards
  -> Design system extracted from existing creatives
    -> Creative generation produces on-brand variants
      -> Market intelligence embedded automatically for target region
        -> Creatives run on ad platforms
          -> Performance data flows back
            -> System learns what works for this brand in this market
              -> Design system refines (performance-validated)
                -> Creative generation improves
                  -> Repeat
```

Each revolution produces three compounding assets:
1. **Better brand design systems** — performance data validates and refines visual rules per brand.
2. **Better market intelligence** — aggregated patterns across brands reveal what works per market/category/moment.
3. **Better creative generation** — the generator learns which choices correlate with performance for specific brand-market-audience combinations.

This compounding intelligence is the moat. A competitor entering later can replicate any individual feature but not the accumulated intelligence from thousands of flywheel cycles.

### Confidence System

All features surfacing intelligence must tag outputs against a four-tier confidence system. This is non-negotiable.

- **Tier 1: Verified facts.** Census data, published platform statistics, confirmed festival dates and regional significance, actual campaign performance data from connected accounts. High confidence.
- **Tier 2: Observed patterns.** Aggregated trends across campaigns — "UGC creatives have lower CPA in Tier 2 for beauty based on N campaigns." These carry sample size and recency tags. Moderate confidence.
- **Tier 3: Directional inferences.** AI-generated hypotheses about why something works or predictions about untested markets. Explicitly labeled as hypotheses. Low confidence.
- **Tier 4: Stated unknowns.** When the platform lacks sufficient data, it says so explicitly. It may offer analogies ("no data for pet food in Bhopal, but here's what we see in comparable Tier 2 cities") clearly labeled as analogical reasoning.

Every recommendation, evaluation, brief, and generated creative rationale must reference the appropriate confidence tier. This system is a cross-cutting requirement that applies to every feature in the platform.

### Data Sharing Architecture

The platform's intelligence improves as more agencies contribute data, but agencies' competitive advantage is precisely the proprietary knowledge about what works in specific markets. This tension determines the product's architecture and go-to-market.

**Brand-specific intelligence (private, never shared):** Everything about a specific brand — its design system, its performance data, its campaign history, its audience insights — belongs to the agency managing that brand. Other agencies never see it. If the agency leaves, they can export it. This is the agency's work product, systematized.

**Market-level intelligence (aggregated, anonymized, shared):** Statistical patterns stripped of brand identity. "UGC-style creatives for beauty brands in Tier 2 North India have 2.1x higher CTR" comes from aggregating hundreds of campaigns — no one can identify which brands or which agencies contributed. This is the layer that gets richer with more participants.

**Private mode as product tier:** Agencies can use the platform in "private mode" — brand design system and creative generation work fully, but they neither contribute to nor access the market intelligence network. This is a weaker product, but it respects agencies that can't or won't share. The pricing difference between private and network modes creates a natural incentive to participate.

**Minimum aggregation thresholds:** No market-level insight is surfaced unless it draws from at least 20 campaigns across at least 5 distinct brands. This prevents reverse-engineering.

**Audit logs and client consent flows:** Agency-level audit logs showing what data was contributed and how it was aggregated. Client consent flows ensure the agency has client permission to connect ad accounts. The platform provides template language for agency-client contracts.

This determines the product's architecture and go-to-market.

---

## 6. Feature Requirements (MVP)

### 6.1 Brand Design System Builder

**Priority:** P0 — This is the entry point. Delivers value before the agency commits to anything else.

**Description:**
Extracts a structured brand design system from a brand's existing creative work. Most small Indian D2C brands have no documented design system. This feature reverse-engineers one from what they've already produced, then lets the agency formalize it through guided curation rather than blank-page creation.

This is also the scaling enabler: junior designers produce on-brand work on the first attempt without senior oversight, new designers onboard in days instead of weeks, and the design system becomes the structured input that makes AI creative generation reliable rather than generic.

**User Stories:**

- As an agency account manager, I want to upload a brand's past creatives and receive a structured design system so that I have documented brand guidelines without spending days creating them manually.
- As a designer, I want a defined set of visual rules (colors, typography, layouts) for each brand so that I can produce consistent work without guessing.
- As a D2C founder, I want to see my brand's visual identity articulated systematically for the first time so that I understand what my brand actually looks like and can make intentional decisions about it.
- As an account manager, I want regional variant rules within the design system so that adaptations for different markets follow defined guidelines instead of being reinvented each time.
- As an agency founder, I want codified brand systems for every client so that I can onboard new designers and scale to 20+ brands without my creative director reviewing every piece.

**Input:**
- 50+ past creatives (uploaded directly or connected via Canva/Google Drive)
- Brand logo (all available formats)
- Any existing brand assets (color codes, fonts, mood boards — optional; most brands won't have these)

**Output: Draft Brand Design System containing:**

- **Color palette:** Primary, secondary, and accent colors actually used across creatives (not just the "official" brand color). Includes frequency analysis — which colors appear most often and in what contexts.
- **Typography:** Font families, heading/body hierarchy, text density patterns, text size conventions.
- **Layout structures:** Dominant compositions (product-left, product-center, text overlay, text-below, etc.) with frequency and context mapping.
- **Image treatment:** Photography style (lifestyle vs. flat lay vs. UGC-style vs. illustration), filter/color grading patterns, product prominence conventions.
- **Copy patterns:** Tone (formal vs. casual), structure (offer-led vs. benefit-led vs. question hooks), CTA conventions, language mix (English / Hindi / Hinglish / regional).
- **Logo usage:** Placement, sizing, and background conventions observed across creatives.
- **Inconsistency report:** Where the brand's creative work contradicts itself ("Instagram creatives use warm tones, Google Display uses cold blues — is this intentional?").
- **Onboarding guide:** A summary view designed for new team members — the essential brand rules a designer needs to start producing on-brand work immediately.

**Acceptance Criteria:**

1. System processes 50+ creatives and produces a draft design system within 10 minutes.
2. Draft design system covers all six visual dimensions listed above.
3. Inconsistencies between creatives are surfaced with specific examples.
4. Agency can edit every element of the draft — approve, modify, or reject each extracted rule.
5. Guided refinement prompts help agencies make intentional decisions ("Your top-performing creatives consistently use large text overlays. Make this a guideline?").
6. Final approved design system is stored as the brand's source of truth on the platform.
7. Design system supports regional variant layers (at minimum: language-specific typography rules, regional color adaptations).
8. New creatives uploaded after initial extraction are checked against the approved system; drift is flagged.

**Edge Cases & Constraints:**

- **Fewer than 50 creatives:** System should still produce a draft with explicit low-confidence flags on dimensions where data is insufficient. Minimum viable input: 20 creatives.
- **Highly inconsistent creative history:** Some brands have no coherent visual identity. The system should surface this clearly ("No dominant pattern detected for layout — your creatives use 5+ different structures with no clear preference") rather than forcing a false consensus.
- **Multiple product lines with different visual treatments:** System should detect and suggest separate sub-systems if a brand's creatives cluster into distinct visual groups.
- **Non-standard formats:** Creatives may include screenshots, WhatsApp forwards, or low-resolution images. System should gracefully exclude unusable inputs and note what was excluded.
- **Brand evolution:** If a brand redesigned 6 months ago, older creatives may conflict with current identity. System should support date-range filtering to weight recent work.

---

### 6.2 Basic Creative Generation

**Priority:** P0 — This is the primary value driver of the platform.

**Description:**
Generates 4-8 static ad creative variants, constrained by the brand's design system and informed by embedded market intelligence. Not aiming to replace designers — aiming to produce "80% done" drafts that a designer finishes in 15 minutes instead of starting from scratch. This is the feature that delivers on the "3x productivity" promise and the one agencies will use daily.

**Production scaling math:** An agency with 15 brands needs 600-1200 creatives/month. At 8-12 creatives/designer/day, that's 3-5 full-time designers. If creative generation produces drafts that are 80% done, each designer can refine 3x more output — supporting the same volume with fewer designers or scaling to more brands with the same team.

**User Stories:**

- As a designer, I want AI-generated creative drafts that follow the brand's design system so that I start from an on-brand foundation instead of a blank canvas.
- As an account manager, I want multiple creative variants exploring different approaches so that I can evaluate options without commissioning each one manually.
- As a media buyer, I want each variant to include a rationale explaining why that approach was chosen so that I can make informed decisions about which to test.
- As an agency founder, I want my 3-person design team to produce the output of a 9-person team so that I can take on more brands without proportionally increasing headcount.

**Input:**
- Brand design system (required — generation without a design system is not supported)
- Product images / assets (provided by agency)
- Target platform and format (Instagram feed, story, Facebook feed, Google Display — MVP formats)
- Target geography and language (English or Hindi for MVP)
- Campaign brief (optional — enhances output with strategic direction but is not required; minimum viable input is brand design system + product images + region + format)

**Output:**
- 4-8 static ad creative variants in the specified format
- Each variant includes:
  - The creative itself (production-ready dimensions, appropriate resolution)
  - **Rationale:** Why this variant was generated — which market intelligence and design system rules informed it. Example: "Testimonial layout chosen because testimonial-style creatives for beauty brands in Tier 2 North India show 1.7x higher CTR. Hindi-English code-mixed copy because this outperforms pure English by 2.1x in this segment."
  - **Design system compliance tag:** Which brand guidelines were applied and any intentional deviations (with reasoning).
- Variants should explore meaningfully different approaches within brand constraints (not minor text swaps):
  - Different layout structures (e.g., product-centric vs. lifestyle vs. testimonial)
  - Different copy approaches (offer-led vs. benefit-led vs. social proof)
  - Different visual emphasis (product prominence vs. lifestyle context vs. model/face)

**Generation Architecture: Templates to Components to AI Layouts**

The creative generation system uses a template-based approach that evolves through three stages. This is a deliberate architectural choice — not a limitation to apologize for.

_Why templates, not fully generative AI:_ Current AI image generation cannot reliably render Devanagari script, enforce precise brand design system constraints, or produce output that feels native to Indian advertising aesthetics. Templates with proper typesetting, real product images, and brand-constrained design elements produce output designers will actually use. The quality bar is "designer prefers to refine this over starting fresh" — templates reliably clear it, fully generative approaches don't yet.

_How templates create variety:_ Variation comes from combining multiple independent axes, not from the templates alone:

- **Layout variety (structural):** 15+ templates across distinct categories — product-hero, testimonial, offer-led, split-layout, text-overlay, lifestyle, social-proof, benefit-grid. Each is a fundamentally different composition, not a minor variation.
- **Copy variation (messaging):** Claude generates 2-3 distinct messaging approaches per template — benefit-led, offer-led, question hook, social proof, testimonial. Same layout, completely different communication strategy.
- **Color scheme shifts (visual):** Same template renders differently with primary-dominant, secondary-accent, dark mode, or festival-specific palettes drawn from the brand design system.
- **Visual emphasis (content):** Product-on-white vs. lifestyle imagery vs. face-focus vs. flat-lay — controlled by image treatment selection.
- **Regional adaptation (market):** Language, cultural motifs, price framing, and visual conventions change per region, producing distinct variants from the same base template.

Combined: 15 templates x 3 copy approaches x 3 color schemes x 2 visual emphases = 270+ possible combinations per brand. For context, scroll through Meta Ad Library — most Indian D2C ads already follow ~10 layout patterns. Agencies reuse structures constantly. A well-designed template set covers 80%+ of what agencies actually produce.

_The template staleness problem and how to solve it:_ After a few months of use, agencies will recognize recurring patterns. This is the primary risk. Three mitigations, in order of implementation:

1. **Parameterized templates (MVP):** Templates are not rigid layouts — they expose continuous parameters: text position on a grid (not just "top-left" or "bottom-right"), element sizing as a range, variable spacing/padding, flexible element count (1-5 product images, 0-3 text blocks). This turns each template into a family of variations rather than a single fixed layout.

2. **Component composition (Post-MVP, Phase 2-3):** Instead of full-page templates, build a library of composable components — hero blocks, price badges, CTA buttons, testimonial cards, product grids, text sections. These can be assembled in different arrangements per generation, producing novel compositions from familiar building blocks. The design system constrains which components are appropriate for the brand; the arrangement varies.

3. **AI-assisted layout generation (Post-MVP, Phase 3+):** Use Claude to generate the HTML/CSS layout itself, not just fill a template. The brand design system provides constraints (colors, fonts, logo rules, approved layout patterns), Claude proposes novel compositions within those constraints. This is where the system moves beyond templates entirely — but only after template quality is validated and the design system constraint engine is battle-tested.

_Ongoing template investment:_ The template library is not a one-time build. Treat it like a content library — add 5-10 new templates monthly based on trending patterns from Meta Ad Library analysis, agency feedback, and performance data from generated creatives. Templates that produce high-performing output get prioritized; underperforming templates get deprecated.

**Indian Market Quality Considerations:**

- **Devanagari text rendering:** Current AI image generation tools render Devanagari script poorly — illegible characters, incorrect conjuncts, broken matras. This is not acceptable for production creatives. The platform must ensure proper Indian-language typography through typesetting (not rendering text within generated images).
- **Indian aesthetic norms:** Global AI models don't capture the visual conventions of Indian advertising — color palettes, model representation, lifestyle imagery, product presentation styles. Generated creatives must feel native to Indian advertising, not like Western templates with Hindi text.
- **Progressive quality improvement:** Start with reliable template-based output and progressively introduce more generative elements as quality thresholds are met for Indian market contexts. The three-stage evolution (parameterized templates → component composition → AI-assisted layouts) defines the progression path.

**Acceptance Criteria:**

1. Generates 4-8 variants within 3 minutes.
2. All variants comply with the brand's approved design system (colors, typography, logo placement, layout rules).
3. Each variant includes a written rationale linking generation choices to market intelligence and/or design system rules.
4. Variants are meaningfully diverse — at minimum 3 distinct creative approaches across the set.
5. Output is in production-ready format and resolution for the specified platform.
6. Agency can request regeneration of individual variants with specific adjustment instructions ("make this one more product-focused" or "try a different headline approach").
7. Hindi and other Indian-language output uses correct script with proper typography — text is typeset, not rendered within AI-generated images. Devanagari conjuncts, matras, and ligatures must render correctly.
8. Generated creatives should not look "AI-made" — they should be indistinguishable from competent designer work within the brand's system.
9. Creative generation works with just a brand design system and basic parameters (no campaign brief required).

**Edge Cases & Constraints:**

- **No product images provided:** System generates layout and text elements with placeholder areas clearly marked for image insertion. Does not generate product photography.
- **Design system is minimal (few rules extracted):** System generates with available constraints and flags where it made assumptions. "Your design system doesn't specify a layout preference. These variants explore multiple layouts — approve the ones that feel right to refine your system."
- **Brand guidelines conflict with format requirements:** E.g., brand uses large text but the format is a small Google Display ad. System adapts within reason and notes the adaptation.
- **Offensive or inappropriate generation:** Cultural intelligence layer acts as a hard filter. Creatives must not include imagery, colors, or text inappropriate for the target region's cultural context. This is a blocking check, not a warning.
- **Regional language quality:** Hindi copy must be natural and idiomatic, not machine-translated. If quality cannot be assured, system should flag for human review rather than output poor-quality copy.

---

### 6.3 Campaign Planning Assistant (D2C Beauty/Fashion Vertical)

**Priority:** P1 — Enhances creative generation with strategic direction but does not gate it.

**Description:**
Generates structured, evidence-backed campaign briefs by combining the brand's design system and profile with market intelligence for the target geography, audience, and moment. MVP scope is limited to D2C beauty and fashion brands targeting 5 key Indian states plus metro/Tier 1/Tier 2 segmentation.

**Important:** Creative generation does NOT require a full campaign brief. Agencies can go straight from brand design system to creative generation with just basic parameters. This feature adds strategic depth for agencies that want it — surfacing intelligence at the moment of planning — but it is not a prerequisite for producing creatives.

**User Stories:**

- As an account manager, I want to input campaign parameters and receive a structured brief with specific creative direction so that I spend 30 minutes refining a draft instead of 3 hours writing from scratch.
- As a media buyer, I want regional intelligence embedded in the brief (platform mix, expected costs, language preferences) so that I can plan execution without guessing.
- As a brand manager, I want to see evidence behind every recommendation in the brief so that I trust the agency's strategic reasoning.

**Input:**
- Brand (auto-populated from brand profile on the platform)
- Product/offer being promoted
- Target geography (state, city tier, or specific cities)
- Target audience segment
- Campaign objective (awareness / consideration / conversion)
- Campaign time period
- Budget range (optional)

**Output: Structured campaign brief containing:**

- **Creative direction** with evidence: recommended visual style, image treatment, layout approach — each citing data source, sample size, and confidence level. Example: "UGC-style creatives for beauty brands in Tier 2 North India show 2.1x higher CTR based on 340 campaigns in our dataset."
- **Language and tone recommendation:** Specific guidance on language mix (English / Hindi / Hinglish / regional), register (formal vs. casual), and code-mixing patterns — with evidence.
- **Platform allocation suggestion:** Recommended platform mix for the target geography and segment, with rationale.
- **Price framing guidance:** How to present pricing for this audience (absolute price, discount percentage, EMI, comparison to offline) — based on category and tier intelligence.
- **Cultural moment opportunities:** Festivals, cultural events, or seasonal patterns falling within the campaign window, with specific creative angles.
- **Pitfalls to avoid:** Specific warnings based on market intelligence. Example: "Avoid English-only copy in this segment — campaigns with Hindi copy show 45% lower CPA."
- **Confidence indicators:** Every recommendation tagged with confidence level (high / moderate / directional), data source, sample size, and date range.
- **Contradictory evidence:** Where data points conflict, both sides are shown.

**Acceptance Criteria:**

1. Brief is generated within 2 minutes of input submission.
2. Every recommendation includes a visible evidence citation (source, sample size, confidence, date range).
3. When data is insufficient, the system explicitly states limitations: "Limited data for [segment] in [geography] (n=X). Recommendations are directional — recommend testing with small budget."
4. Brief references and builds on the brand's design system (visual direction aligns with approved brand guidelines).
5. Output is structured for both internal agency use and client presentation (clean formatting, no jargon the client wouldn't understand).
6. Agency can edit, override, or annotate any recommendation before finalizing.

**MVP Intelligence Scope:**

- **Verticals:** D2C beauty and fashion only.
- **Geographies:** Maharashtra, Karnataka, Tamil Nadu, Delhi NCR, Uttar Pradesh — plus metro/Tier 1/Tier 2 segmentation within each.
- **Intelligence sources (initial):** Manually curated from Meta Ad Library analysis, IAMAI reports, published platform data, Census demographics, and industry surveys. Enriched over time with platform usage data.

**Edge Cases & Constraints:**

- **New brand with no performance history:** Brief relies entirely on market intelligence and category patterns. Explicitly notes: "No brand-specific performance data available. Recommendations based on category-level intelligence."
- **Geography outside MVP scope:** System should clearly state coverage limitations rather than extrapolating. "Gujarat is not yet in our intelligence coverage. Here's what we can infer from adjacent markets (directional only)."
- **Conflicting brand guidelines and market intelligence:** If the brand's design system conflicts with what works in the target market (e.g., brand uses English-only but market data says Hindi outperforms), surface the tension explicitly and let the agency decide.
- **Micro-targeting requests:** If the specified geography/segment is too narrow for meaningful data, aggregate to the nearest level where data exists and state the aggregation.

---

### 6.4 Brand Compliance & Quality Checker

**Priority:** P1

**Description:**
Evaluates any creative (human-made or AI-generated) against the brand's design system for objective, rule-based compliance, and checks for cultural sensitivity issues in the target market. At scale (15+ brands), the founder/CD can't review every creative. This tool catches "this creative uses the wrong font" or "this color isn't in the brand palette" before it goes to the client — saving real time and preventing real embarrassment.

**User Stories:**

- As a designer, I want to check my creative against brand guidelines before submission so that I catch inconsistencies before the client sees them.
- As a creative director, I want automated brand compliance checking across all 20 brands so that I can scale quality oversight without reviewing every creative personally.
- As an account manager, I want an objective creative assessment I can share with the client so that feedback is based on defined rules ("this violates guideline X"), not subjective opinion ("I don't like it").

**Input:**
- Creative file (static image; video evaluation is out of scope for MVP)
- Brand design system (required)
- Target geography and audience segment
- Target platform (optional — for format-specific checks)

**Output: Structured evaluation containing:**

- **Brand guideline alignment (primary focus):**
  - Color usage: matches/deviates from approved palette (specific deviations identified)
  - Typography: correct fonts, sizes, hierarchy
  - Layout: follows approved structures
  - Logo: correct placement, sizing, clear space
  - Copy tone: matches approved voice
  - Overall brand consistency score with specific compliance/deviation details
- **Cultural sensitivity check:**
  - Language suitability for target geography (correct script, appropriate register, natural phrasing)
  - Cultural sensitivity check (no inappropriate imagery, colors, or references for the target market)
  - Price framing appropriateness for target tier
- **Red flags:** Any blocking issues — cultural insensitivity, regulatory concerns, brand guideline violations that would be visible to clients.
- **Improvement suggestions:** Specific, actionable changes with reasoning. "Consider increasing text size — Devanagari text at this size has readability issues on mobile in feed format."

**Future enhancement:** Performance pattern comparison (how does this creative compare to patterns of high-performing creatives in this segment) may be added once sufficient performance data is accumulated. This requires a meaningful dataset to be credible and is not included in the initial release.

**Acceptance Criteria:**

1. Evaluation produced within 1 minute.
2. Every assessment point references the brand's design system rules or cultural sensitivity guidelines (no unsupported opinions).
3. Cultural sensitivity flags are treated as hard blockers, not suggestions — they are prominently displayed.
4. Evaluation is structured for both internal review and client presentation.
5. System can evaluate creatives not generated by the platform (human-made work uploaded for assessment).
6. Feedback is specific and actionable, not generic ("increase contrast" is not useful; "headline text is below readable threshold for mobile feed — increase from 24pt to 32pt based on your brand's typography guidelines" is useful).

**Edge Cases & Constraints:**

- **Creative for a market outside intelligence coverage:** Evaluate against brand guidelines only; explicitly state that cultural sensitivity cannot be assessed for this geography.
- **No brand design system exists yet:** Refuse evaluation or offer to create one. Evaluation without a baseline is meaningless.
- **Creative with multiple languages:** Evaluate each language element against the appropriate regional intelligence.
- **Creative that intentionally breaks guidelines:** Agency should be able to mark deviations as intentional ("we know this breaks the color rule — it's for a specific campaign concept"). System acknowledges and doesn't re-flag.

---

### 6.5 Festival Season Module

**Priority:** P1

**Description:**
Production accelerator for the highest-pressure creative moment of the year. An agency with 20 brands needs festival creatives for ALL of them in a 4-6 week window: 20 brands x 5 regions x 3 platforms = 300 creative concepts in 4 weeks. This is when agencies actually break down, hire freelancers, miss deadlines, and produce poor work. The Festival Module combines festival-specific cultural intelligence with brand design systems to generate regionally appropriate festival campaign creatives at 3x speed.

**User Stories:**

- As an agency founder, I want to produce region-adapted festival creatives for all 20 brands in 4 weeks so that my team doesn't break down during Diwali season — the module should turn a 300-concept nightmare into a manageable production run.
- As an account manager, I want festival-specific creative direction per region so that I don't run the same Navratri campaign in Gujarat and Tamil Nadu.
- As a designer, I want festival-appropriate color palettes, visual motifs, and copy angles per region so that I produce culturally correct work without deep regional expertise.

**Input:**
- Brand design system
- Festival (Diwali or Navratri for MVP)
- Target regions (one or more)
- Product/offer
- Campaign objective

**Output:**

- **Festival intelligence per region** (embedded in the creative generation flow, not as standalone reports):
  - Cultural significance and emotional tone (how this festival is observed in this specific region)
  - Approved visual language: color palettes, motifs, imagery conventions (and what to avoid)
  - Effective creative angles for this festival in this region (gifting, self-purchase, family, celebration, etc.)
  - Historical performance patterns: what has worked for this category during this festival in this region
  - Key timing: when festival campaign should start, peak engagement windows, post-festival tail

- **Festival-specific creative variants:**
  - Region-adapted creatives using the brand's design system + festival visual layer
  - Example for a skincare brand during Navratri:
    - Hindi version for UP/Rajasthan: red-and-gold palette, festive motifs, EMI pricing
    - Gujarati version for Gujarat: dandiya visual references, percentage-off framing
    - Tamil version for Tamil Nadu: Navaratri/golu/kolu themes (different cultural emphasis than North India)
    - Metro English version: subtle festive elements, product emphasis
  - Each variant includes rationale and cultural notes

- **Festival campaign brief template:** Pre-structured brief optimized for the festival, incorporating all regional intelligence.

**Retention lock-in:** If this feature works well during ONE festival season, it creates massive loyalty. Agencies will stay on the platform for the next season. Festival seasons are predictable, high-stakes, and high-volume — exactly the moments where platform value is most visible.

**Acceptance Criteria:**

1. Festival intelligence covers at minimum 5 major regions with distinct cultural treatment of the festival.
2. Cultural information is verified by subject-matter review (not purely AI-generated) — errors here are trust-destroying.
3. Regional creative variants are visually distinct from each other while maintaining brand consistency.
4. System clearly distinguishes between verified cultural facts and inferred patterns.
5. Festival visual assets (color palettes, motif guidance) are specific enough for a designer to use directly.
6. Timing recommendations include specific date ranges, not just "before the festival."
7. Available at least 6 weeks before the festival season to support campaign planning timelines.

**Edge Cases & Constraints:**

- **Brand has never run a festival campaign:** Generate recommendations from category-level intelligence; note absence of brand-specific festival data.
- **Festival observance varies within a state:** Acknowledge sub-regional variation. "Navratri is observed differently in Saurashtra vs. North Gujarat — here's how creative treatment should differ."
- **Religious sensitivity:** Festival creatives must be reviewed against strict cultural sensitivity rules. Inappropriate religious imagery or incorrect festival associations are absolute blockers. The system should err toward conservatism and flag anything borderline for human review rather than generating potentially offensive content.
- **Multi-faith brands:** Some brands serve audiences across religious lines. System should handle "inclusive festive" creative direction (seasonal celebration without specific religious imagery) as a valid option.
- **Festival date shifts:** Hindu and Islamic festivals follow lunar calendars. System must use correct dates for the current year and adjust timing recommendations accordingly.

### What's Explicitly NOT in the MVP

- Video generation
- Self-serve brand tier
- Competitive intelligence
- More than one vertical (beauty/fashion only)
- More than two languages (Hindi + English)
- Full market intelligence network (curated data only, not yet aggregated from agencies)
- Ad account API connections (CSV upload for data ingestion)

---

## 7. Feature Requirements (Post-MVP)

The following features extend the platform's production capabilities and intelligence after MVP validation. Listed in approximate priority order, though sequencing will be informed by early usage data.

### 7.1 Advanced Creative Generation

**Generation architecture evolution (from Section 6.2):**

- **Component composition system:** Replace full-page templates with a library of composable components (hero blocks, price badges, CTA buttons, testimonial cards, product grids). Components are assembled in varying arrangements per generation, producing novel compositions from familiar building blocks. The design system constrains which components are appropriate; arrangement varies per generation.
- **AI-assisted layout generation:** Claude generates HTML/CSS layouts directly, within brand design system constraints. The system proposes novel compositions — not filling templates, but creating them. Requires the design system constraint engine to be battle-tested from template-based generation first.
- **Template library as ongoing investment:** Continuous addition of 5-10 new templates monthly based on Meta Ad Library trends, agency feedback, and performance data. High-performing templates prioritized; underperforming templates deprecated.

**Format expansion:**

- **Carousel frameworks:** Structured multi-slide narratives with content flow, visual consistency, and per-slide copy.
- **Video storyboards:** Scene-by-scene storyboards with shot descriptions, text overlays, and timing — not generated video, but a production-ready blueprint.
- **Multi-format adaptation:** Generate one creative concept adapted across feed, story, reel cover, and display formats simultaneously — maintaining visual coherence.

### 7.2 In-Platform Creative Editing

Allow designers to refine AI-generated creatives directly within the platform — adjusting text, swapping images, tweaking layouts — rather than exporting to external tools. Reduces friction in the generation-to-production pipeline and keeps the workflow loop closed within the platform.

### 7.3 Regional Expansion Planner

A brand wants to move from metros to Tier 2, or from North India to South India. The platform produces a prioritized expansion roadmap: which cities to target first (based on category demand, competitive density, and platform penetration), what creative and messaging adaptations each market requires, estimated budget needs and expected CPA ranges, and a phased rollout plan. Turns a weeks-long strategy exercise into a structured, evidence-backed recommendation.

### 7.4 Competitive Intelligence

Tracks competitor creative activity through ad library APIs and public sources: what creative styles competitors are running in specific markets, what offers, what language, what frequency. Surfaces differentiation opportunities. "Three of four competing fintech brands in Tamil Nadu are running testimonial ads. There's whitespace for a humor-driven approach." Not surveillance — strategic awareness.

### 7.5 Multi-Vertical Market Intelligence

Expand intelligence depth beyond beauty/fashion to: fintech, food & beverage, health & wellness, edtech, consumer electronics. Each vertical has distinct creative norms, audience behaviors, and regional patterns. Adding verticals multiplies the platform's addressable market and enriches cross-category intelligence.

### 7.6 Client Reporting with Strategic Context

Transforms performance data into narrative reports that explain *why* things worked or didn't: "The Navratri campaign in Gujarat outperformed by 34% compared to national average. Key drivers: Gujarati copy, festival-specific color palette, and price framing anchored to gold prices — culturally relevant during Navratri gifting." The report that makes clients renew.

### 7.7 Self-Serve D2C Tier

Direct access for small D2C brands (Rs.5-50L/month ad spend) without a full-service agency. Simplified interface focused on: brand design system creation, basic creative generation, and market intelligence for expansion decisions. Opens a market much larger than agencies alone.

**Channel conflict resolution:**

- **Deliberately limited tier:** The self-serve tier provides the Brand Design System + basic creative generation. It does NOT include full market intelligence, campaign briefing, competitive intelligence, or strategic reporting. Brands that want the full capability need an agency on the platform.
- **Agency co-branding:** When an agency onboards a brand, the brand's experience is agency-branded. The platform is infrastructure, not a competitor.
- **Agency referral economics:** Brands that outgrow self-serve are referred to partner agencies on the platform. Agencies that bring brands onto the platform get preferential pricing.
- **Different entry points, same flywheel:** Self-serve brands still contribute (with consent) to the market intelligence layer, enriching the data available to agencies. Everyone benefits.

---

## 8. User Flows

### 8.1 Agency Onboarding a New Brand

```
1. Agency creates brand on platform
2. Uploads brand's past 50-100 creatives
   (or connects Canva/Google Drive)
3. Optionally provides: logo, known brand colors, fonts
4. System processes creatives (< 10 min)
5. System presents Draft Brand Design System:
   - Extracted color palette with frequency analysis
   - Typography patterns
   - Layout structures
   - Image treatment conventions
   - Copy tone patterns
   - Inconsistency report
6. Agency reviews with client:
   - Approves, modifies, or rejects each extracted rule
   - Responds to guided prompts ("Make this a guideline?")
   - Adds regional variant rules (guided by platform suggestions)
7. Design system is saved as brand's source of truth
8. Agency optionally connects ad accounts for performance data enrichment
```

**Expected time:** 20-30 minutes of active agency work (after processing).

### 8.2 Quick Generate (Design System to Creatives)

```
1. Agency selects brand (design system auto-loaded)
2. Uploads product images/assets
3. Selects target platform, format, region, and language
4. System generates 4-8 variants (< 3 min):
   - Each with visual rationale
   - Market intelligence for target region embedded automatically
   - All compliant with brand design system
5. Agency reviews variants:
   - Selects promising variants
   - Requests regeneration with adjustments
   - Downloads production-ready files
6. Designer refines selected variants
7. Final creatives uploaded back for design system learning
```

**This is the fastest path to value:** upload assets, have a design system, generate creatives. No brief required.

### 8.3 Creating a Campaign Brief (Optional)

```
1. Agency selects brand (profile auto-populates)
2. Inputs campaign parameters:
   - Product/offer
   - Target geography
   - Target segment
   - Objective (awareness/consideration/conversion)
   - Time period
   - Budget range (optional)
3. System generates structured brief (< 2 min):
   - Creative direction with evidence citations
   - Language/tone recommendations
   - Platform allocation
   - Cultural moment opportunities
   - Pitfalls to avoid
4. Agency reviews brief:
   - Edits recommendations as needed
   - Adds client-specific context
   - Overrides where their judgment differs (with notes)
5. Brief finalized — available for enhanced creative generation or manual execution
```

**Note:** This flow enhances creative generation with strategic direction but is not a prerequisite. Agencies can use Flow 8.2 (Quick Generate) without creating a brief first.

### 8.4 Generating Creatives from a Brief

```
1. Agency selects a campaign brief
2. Uploads product images/assets (if not already provided)
3. Selects target platform and format
4. Selects language (English/Hindi for MVP)
5. System generates 4-8 variants (< 3 min):
   - Each with visual rationale informed by brief + intelligence
   - Meaningfully diverse approaches
   - All compliant with brand design system
6. Agency reviews variants:
   - Selects promising variants
   - Requests regeneration with adjustments ("more product-focused")
   - Downloads production-ready files
7. Designer refines selected variants (outside platform or in future: in-platform editing)
8. Final creatives uploaded back for design system learning
```

### 8.5 Evaluating a Creative Pre-Launch

```
1. Agency uploads creative (human-made or AI-generated)
2. Selects brand, target geography, target segment
3. System produces evaluation (< 1 min):
   - Brand guideline alignment (specific compliance/deviations)
   - Cultural sensitivity assessment
   - Red flags (cultural, regulatory)
   - Improvement suggestions with reasoning
4. Agency acts on feedback:
   - Addresses red flags (mandatory for cultural sensitivity)
   - Considers improvement suggestions
   - Marks intentional deviations if applicable
5. Creative approved or sent back for revision
```

### 8.6 Festival Campaign Workflow

```
1. Agency opens festival module (6+ weeks before festival)
2. Selects brand, festival, target regions
3. System presents festival intelligence per region:
   - Cultural significance and emotional tone
   - Visual language (colors, motifs, imagery)
   - Effective creative angles
   - Historical performance data
   - Timing recommendations
4. Agency creates festival campaign brief:
   - Uses pre-structured festival template
   - Customizes per region based on intelligence
5. System generates region-adapted creative variants:
   - Each region gets culturally appropriate visuals
   - Brand consistency maintained across regions
   - Cultural notes and rationale per variant
6. Agency reviews across regions:
   - Ensures brand coherence
   - Verifies cultural appropriateness
   - Sends for designer refinement
7. Festival creatives finalized per region
8. Post-campaign: performance data feeds back into festival intelligence
```

---

## 9. Information Architecture

### Key Entities

**Brand**
The top-level entity. Represents a D2C brand managed on the platform. Contains brand profile (category, target markets, positioning), connected data sources (ad accounts, analytics), and performance history.

**Design System**
Belongs to a Brand. The formalized visual and messaging identity: color palette, typography, layouts, image treatment, copy tone, logo rules. Contains a master system and zero or more Regional Variants. Evolves over time as new creatives and performance data inform refinements. Tracks version history.

**Regional Variant**
Belongs to a Design System. Defines how the brand adapts for a specific geography or language: typography adjustments (e.g., larger Devanagari text), color adaptations, cultural motifs, language register rules, price framing conventions.

**Campaign**
Belongs to a Brand. A planned or executed advertising effort with defined geography, audience, objective, timeframe, and budget. Contains an optional Campaign Brief and zero or more Creatives.

**Campaign Brief**
Belongs to a Campaign. The strategic document guiding creative production: creative direction, language recommendations, platform allocation, cultural considerations, pitfalls. Each recommendation carries evidence metadata (source, confidence, sample size). Optional — creative generation can proceed without one.

**Creative**
Belongs to a Campaign (or directly to a Brand for quick-generate creatives without a campaign). An individual ad creative asset. Can be human-made (uploaded) or platform-generated. Carries metadata: target platform, format, language, region. If generated, includes generation rationale. If evaluated, includes evaluation results. Performance data attached when available.

**Evaluation**
Belongs to a Creative. A structured assessment: brand compliance, cultural sensitivity, red flags, improvement suggestions. Each assessment point references the brand's design system rules or cultural sensitivity guidelines.

**Market Intelligence**
Platform-level entity (not brand-specific). Structured knowledge organized by geography, category, cultural moment, creative pattern, and audience segment. Each intelligence entry carries confidence level, source, sample size, and freshness date.

**Festival Intelligence**
A specialized subset of Market Intelligence. Cultural significance, visual language, creative angles, timing, and historical performance — organized by festival and region.

### Entity Relationships

```
Brand
 |-- Design System
 |    |-- Regional Variant (0..n)
 |
 |-- Campaign (0..n)
 |    |-- Campaign Brief (0..1, optional)
 |    |-- Creative (0..n)
 |         |-- Evaluation (0..1)
 |         |-- Performance Data (0..1)
 |
 |-- Creative (0..n, quick-generate without campaign)

Market Intelligence (platform-level)
 |-- Geographic Intelligence
 |-- Category Intelligence
 |-- Cultural Intelligence
 |-- Creative Pattern Intelligence
 |-- Audience Segment Models
 |-- Festival Intelligence
```

**Key relationships:**
- Creative Generation can operate with just a Brand's Design System + basic parameters (region, format, product images). A Campaign Brief enhances output but is not required.
- A Campaign Brief, when created, is informed by both the Brand's Design System and relevant Market Intelligence.
- Creative Evaluation checks against Design System + cultural sensitivity rules.
- Performance Data on Creatives feeds back into both the Brand's Design System (brand-specific learning) and Market Intelligence (aggregated, anonymized patterns).
- Festival Intelligence connects to Regional Variants within Design Systems to produce festival-specific regional creatives.

---

## 10. Success Metrics & KPIs

### Product-Market Fit Signals (Months 1-6)

- Agencies complete brand design system onboarding for >80% of brands they manage (not just one trial brand)
- Generated creatives require <30 minutes of human refinement on average (vs. 2+ hours creating from scratch)
- Agency team members reference the campaign briefing assistant before >50% of new campaigns
- At least one agency says unprompted: "We use this to onboard new team members"

### Business Health (Months 6-18)

- Net revenue retention >120% (agencies add more brands over time)
- <10% monthly churn on paid accounts
- >60% of agencies on network mode (contributing and accessing shared intelligence)
- Average creative generation volume increases month-over-month per brand (indicating trust in output quality)

### Intelligence Quality (Ongoing)

- Recommendation accuracy tracking: campaigns following platform recommendations outperform those that don't by measurable margin
- Decreasing "learning spend" for brands entering new regions (measurable through connected ad account data)
- Cultural error rate: zero tolerance. Any cultural error in generated creative is a P0 incident.

### Flywheel Velocity

- Time from brand onboarding to first generated creative campaign: target <1 week
- Market intelligence refresh lag: patterns updated within 30 days of new campaign data
- Cross-brand learning speed: how quickly a pattern observed in 5 brands becomes a reliable recommendation for the 6th

### Reference: Operational Metrics

The following tables provide granular tracking targets that support the categories above.

**Product Metrics (Is the product being used?)**

| Metric | Definition | Target (6 months post-MVP) |
|--------|-----------|---------------------------|
| Creatives generated | AI-generated creative variants per month | 1,000+ |
| Brands onboarded | Brands with completed design systems | 50+ |
| Active agencies | Agencies using platform weekly | 10+ |
| Creative volume per agency | Average creatives generated per active agency per month | 100+ |
| Briefs generated | Campaign briefs created per month | 100+ |
| Evaluations run | Creative evaluations per month | 500+ |
| Design system engagement | % of brands with design system updated in last 30 days | >60% |

**Value Metrics (Is the product delivering value?)**

| Metric | Definition | Target |
|--------|-----------|--------|
| Designer output multiplier | Creatives produced per designer per day | 2-3x baseline |
| Time to first creative output | Time from new brand onboarding to first generated creative | <1 hour |
| Creative production time | Time from brief to production-ready creative | <45 min with AI draft + designer refinement (vs. 2-3 hours baseline) |
| Brief creation time | Time from input to finalized brief | <30 min (vs. 3-5 hours baseline) |
| Creative consistency | % of creatives passing brand guideline evaluation | >85% (vs. unmeasured baseline) |
| Festival campaign efficiency | Time to produce multi-region festival creative set | <1 day (vs. 2-3 days baseline) |

**Business Metrics (Is this a business?)**

| Metric | Definition | Target (12 months) |
|--------|-----------|-------------------|
| MRR | Monthly recurring revenue | Product-market fit signal: Rs.5L+ |
| Agency retention | % of agencies retained after 6 months | >80% |
| Creative volume per agency | Growth in creatives generated per agency over time | 2x growth in first 6 months |
| Brand expansion | Avg brands per agency on platform (growth) | Starting 2-3, growing to 5+ |
| NPS | Net Promoter Score from agency users | >40 |
| Revenue per agency | Average monthly revenue per active agency | Rs.25-50K |

---

## 11. Phasing & Roadmap

### Phase 1: Curated Foundation (Pre-Launch, 3-4 months)

**Objective:** Build the production foundation, initial market intelligence, and Brand Design System Builder to production quality.

**Activities:**
- Build and test the Brand Design System extraction pipeline with 10-15 real brand creative sets.
- Build template-based creative generation pipeline with support for structured layouts, real product image compositing, and proper Devanagari typography.
- Validate Indian-language typography rendering across common fonts and formats.
- Compile market intelligence for MVP scope (beauty/fashion vertical, 5 states, metro/Tier 1/Tier 2) from public sources: Meta Ad Library analysis, IAMAI reports, Census demographics, platform-published data, industry surveys.
- Build festival intelligence for one season (Diwali or Navratri) with subject-matter verification.
- Establish the confidence framework: verified facts vs. observed patterns vs. directional inferences vs. stated unknowns.

**Exit criteria:** Design system extraction produces accurate results for test brands. Template-based creative generation produces output that test designers prefer to refine rather than redo. Intelligence base covers MVP scope with sufficient depth. Brand Design System Builder is at production quality — this is the entry point and must be exceptional.

### Phase 2: Early Agency Partnerships (Months 1-6)

**Objective:** Validate product-market fit with 5-10 agencies. Free or discounted access in exchange for ad account connections and structured feedback. Target one vertical deeply (D2C beauty/fashion).

**Core MVP scope:** Design System Builder (P0) + Creative Generation (P0).

**Secondary MVP scope:** Campaign Planning Assistant (P1), Brand Compliance & Quality Checker (P1), Festival Module (P1).

**Indian market quality validation:** Can designers at partner agencies use generated creatives as starting points? Is Devanagari rendering acceptable? Do templates feel native to Indian advertising?

**Go-to-market:**
- 5-10 agency partners with free or heavily discounted access in exchange for connected ad accounts and structured feedback.
- Selection criteria: agencies that manage 5+ D2C brands, operate across at least 3 regions, and have a senior person willing to champion internally.
- Each agency onboards 2-3 brands initially.
- Weekly feedback cycles with partner agencies.

**Key validation questions:**
- Do agencies trust the design system enough to use it as source of truth?
- Are generated creatives good enough that designers refine them rather than redo them?
- Is the quick-generate flow (design system + assets -> creatives) delivering on the speed promise?
- Do briefs contain insights the agency didn't already know?
- Does the festival module demonstrate clear value during peak season?

**Exit criteria:** At least 3 agencies actively using the platform for live campaigns (not just testing). At least one agency willing to pay. Designer adoption is the key signal — measure by whether designers choose to use generated output, not by capability metrics.

### Phase 3: Controlled Growth (Months 6-12)

**Objective:** Open to paying agencies. Lead with Brand Design System Builder as hook (delivers standalone value), graduate to full platform.

**Activities:**
- Onboard paying agencies beyond initial partners.
- Focus on agencies in the D2C beauty/fashion/personal care cluster initially — these have the highest festival sensitivity, strongest regional variation, and most urgent creative scaling needs.
- Aggregate anonymized performance data across brands to enrich market intelligence.
- Begin expanding geographic coverage (add more states, deeper Tier 2/3 intelligence).
- Launch post-MVP features based on usage data: Advanced Creative Generation, In-Platform Creative Editing.

### Phase 4: Network Effects (Months 12-18)

**Objective:** Data density makes market intelligence visibly superior to what any individual agency knows.

**Activities:**
- New agencies joining get richer intelligence than early adopters did initially.
- Begin opening the self-serve brand channel in limited form.
- Expand category coverage to fintech, food & beverage, health & wellness.
- Launch Regional Expansion Planner, Competitive Intelligence.

**The network effect:** Each new agency's data improves intelligence for all agencies. This creates a virtuous cycle and a defensible moat — a competitor starting from zero would need to rebuild the entire data network.

### Phase 5: Platform (18+ months)

**Objective:** Market intelligence becomes the primary moat. Creative generation quality makes the platform indispensable for agencies scaling creative production.

**Activities:**
- Consider API access for agencies' internal tools.
- Explore video creative generation.
- Expand to additional verticals and geographies.
- Self-serve brand channel fully operational.

---

## 12. Risks & Mitigations

### Existential Risks

**Cultural error in production.** One creative with wrong script, inappropriate festival imagery, or colors with negative regional connotations — shown to a client — kills platform trust instantly. _Mitigation:_ Cultural intelligence layer acts as a hard filter on generation, not a soft suggestion. Regional cultural review is mandatory before creative output, not optional. Early versions are conservative (flag and withhold rather than generate and hope). Human review is non-negotiable.

**Data breach or perceived data leak between agencies.** If any agency suspects proprietary data reached a competitor, the platform is dead. _Mitigation:_ Over-engineer safeguards. Minimum aggregation thresholds (at least 20 campaigns across at least 5 distinct brands). Third-party audit of anonymization. Transparency reports. The paranoia here is appropriate.

**Meta/Google platform API changes.** The platform depends on ad account APIs for data ingestion. If Meta restricts API access (as it has repeatedly), core functionality degrades. _Mitigation:_ CSV upload fallbacks for all data ingestion. Reduce single-platform dependency. Build value that persists without API connections (design systems, cultural intelligence).

### Strategic Risks

**Cold start quality.** If early recommendations are wrong, agencies lose trust before the data flywheel spins up. _Mitigation:_ Phase 1 intelligence is manually curated and expert-validated, not algorithmically generated. Better to launch with narrow, high-confidence intelligence than broad, shaky intelligence.

**"Good enough" from incumbents.** Canva adds Indian templates. Meta improves its Advantage+ creative optimization for Indian markets. Global tools add Hindi. _Mitigation:_ These are surface-level additions. The depth of regional intelligence, brand system extraction, and performance-informed generation is not replicable by adding a language pack. But the product must reach meaningful depth before incumbents decide to try.

**Agency adoption inertia.** Agencies are busy. Onboarding a new platform is overhead. The team that would use it is the team that's already overloaded. _Mitigation:_ The Brand Design System Builder is the trojan horse — it delivers value in one session with no ongoing commitment. Subsequent adoption is gradual.

**Talent risk.** Building this requires people who understand both Indian advertising and AI/ML engineering. This intersection is extremely small. _Mitigation:_ Advisory board of senior agency professionals. Engineering team doesn't need ad industry experience if the product and data teams do. But the founding team must have at least one person with deep Indian agency experience.

### Known Unknowns

- Will agencies actually connect ad accounts, or will data ingestion be friction-heavy?
- Is the creative generation quality threshold achievable in v1, or will "80% done" drafts still require too much human rework?
- How quickly does market intelligence decay? Is a 6-month refresh cycle fast enough, or do patterns shift quarterly?
- Will brand founders engage with the design system review, or will they delegate and disengage?

These should be resolved through the early agency partnerships in Phase 2, not by assumption.

---

## 13. Design Principles

### Production First

Every feature answers the question: "How does this help produce more, better, faster creative work for more brands?" Intelligence that doesn't surface through the production workflow is infrastructure, not product. If a feature can't be connected to a designer producing better output or an agency supporting more brands, it's not ready to ship — it's a backend capability waiting for a production-facing interface.

### Evidence Over Opinion

Every recommendation the platform makes must be traceable to data: performance data, market data, historical patterns, or the explicit absence of evidence. When the platform doesn't know, it says so. When it infers, it labels the inference. No confident bullshit.

### Show Your Work

Transparency is not optional. Every insight surfaces *why* the platform believes what it believes. Confidence levels are shown. Sample sizes are shown. Contradictory evidence is shown. Data sources and date ranges are shown. The user makes the final call with full context. If a client asks "why does your tool recommend this?" and the agency can't explain it, trust is destroyed for both the platform and the agency.

### Degrade Gracefully

When data is thin, the platform doesn't pretend it's comprehensive. It says: "We have limited data for pet food brands in Tier 3 South India (n=3 campaigns). Here's what we can suggest directionally, but we'd recommend testing these assumptions with a small budget first." It may offer analogies from comparable markets, clearly labeled as analogical reasoning. This is more trustworthy than confident recommendations based on insufficient data.

### Augment Judgment, Don't Replace It

The platform is the most well-informed colleague in the room, not the boss. It says "here's what the evidence suggests and why" — never "do this." Experienced media buyers have contextual knowledge the platform can't capture: client politics, founder preferences, competitive dynamics not visible in data. The platform makes them more informed, not redundant. Users can validate, correct, and override — and their input improves the system.

### Let Users Validate and Correct

Every insight has a feedback mechanism. If a media buyer knows the recommendation is wrong for a specific context, they flag it, add context, and improve the model. This turns agency expertise into structured data while giving them ownership.

### Build Track Record Over Time

The platform tracks its own recommendation accuracy. Over time: "Recommendations followed in full had 23% better ROAS than campaigns that deviated significantly." Proven accuracy drives adoption, which generates more data, which improves accuracy.

---

## 14. Revenue Model

The pricing structure affects feature design and tier differentiation across the platform.

- **Per brand managed:** Agency pays per active brand (design system + intelligence + generation).
- **By creative volume:** Base tier includes N generated creatives/month per brand, usage-based above that. Aligns cost with value.
- **By intelligence tier:** Basic (brand design system + generation) vs. advanced (full market intelligence + campaign briefing + competitive tracking + regional adaptation).
- **Network vs. private mode:** Access to aggregated market intelligence is the premium tier. Private mode (no data contribution or access) is cheaper but weaker.

---

## 15. Out of Scope

### Explicitly Not This Product

- **Digital Asset Management (DAM).** File storage and retrieval is a supporting function, not the product. Creatives are ingested for analysis and design system extraction, not for asset management.
- **Reporting tool.** There are 50 reporting tools. This is a creative production platform that happens to produce reports as one output.
- **Generic AI creative generator.** Tools like AdCreative.ai generate from templates with no brand or market context. This platform generates within a brand's design system and informed by market-specific intelligence. The approach prioritizes template-based reliability over impressive-but-unusable fully generative output — production quality for Indian markets (proper Devanagari rendering, culturally native aesthetics) matters more than demo-worthy generation capabilities.
- **Brand identity agency replacement.** Does not create brands from nothing. Takes what exists — however fragmented — and systematizes it.
- **Generic global tool with an Indian language pack.** The entire intelligence architecture is built around India's market structure. This cannot be replicated by adding a "South Asia" module.
- **Not a campaign optimization tool.** It doesn't bid on ads or allocate budgets in real-time. It informs _what_ to create and _why_, not _how_ to deliver it. It complements tools like Pixis, not competes with them.

### Out of Scope for This Document

- **Technical architecture.** Technology choices, infrastructure, API design, data pipeline architecture — all belong in a separate technical design document.
- **Video generation.** The platform may produce video storyboard frameworks in post-MVP, but generating video content is not in scope.
- **Original photography.** The platform composes with images the agency provides. It does not generate product photography or original lifestyle imagery.
- **Brand creation from scratch.** Brands that need a full identity overhaul need a brand strategist. This product requires at least a minimal existing identity (logo + some creative history) to build from.
- **Markets outside India.** The intelligence architecture is India-specific. International expansion is not planned.
- **Detailed pricing model.** Revenue model implications are noted in the vision document. Specific pricing requires market testing with early agency partners.
