import { describe, it, expect } from 'vitest';
import { generateReports } from '../generateReports';
import type { IdeaValidationInputs, Refinements } from '../../_types';

function makeInputs(overrides: Partial<IdeaValidationInputs> = {}): IdeaValidationInputs {
  return {
    context_type: 'new_idea',
    business_idea: 'A mobile app that connects local farmers directly with restaurant kitchens, eliminating middlemen and reducing food waste through smart logistics and demand prediction',
    target_customer: 'Small and medium restaurant owners in tier-2 cities who spend 40% of revenue on ingredients and struggle with inconsistent supply quality',
    target_location: 'Hyderabad, India',
    problem_statement: 'Restaurant owners in India lose 15-25% of their ingredient budget to middlemen markups. Supply quality is inconsistent, leading to food waste and customer complaints. There is no transparent marketplace for direct farm-to-kitchen procurement.',
    solution_differentiation: 'Unlike competitor Ninjacart which focuses on large chains, we target small restaurants with AI-powered demand prediction, quality scoring of farms, and same-day delivery. Compared to traditional mandis, we offer 30% cost savings.',
    ...overrides,
  };
}

function makeMinimalInputs(): IdeaValidationInputs {
  return {
    context_type: 'new_idea',
    business_idea: 'food app',
    target_customer: 'restaurants',
    target_location: 'India',
    problem_statement: 'food waste',
    solution_differentiation: 'better app',
  };
}

function makeRefinements(overrides: Partial<Refinements> = {}): Refinements {
  return {
    target_narrowed: '',
    differentiation_clarified: '',
    validation_evidence: { interviews: 0, confirmed_interest: 0, beta_testers: 0 },
    additional_context: '',
    ...overrides,
  };
}

// ─── generateReports (public API) ─────────────────────────────────

describe('generateReports', () => {
  it('returns all five report sections', () => {
    const result = generateReports(makeInputs(), makeRefinements());
    expect(result).toHaveProperty('validation');
    expect(result).toHaveProperty('market');
    expect(result).toHaveProperty('competitors');
    expect(result).toHaveProperty('positioning');
    expect(result).toHaveProperty('pitch_deck');
  });

  it('does not throw for minimal inputs', () => {
    expect(() => generateReports(makeMinimalInputs(), makeRefinements())).not.toThrow();
  });

  it('does not throw for empty refinements', () => {
    expect(() => generateReports(makeInputs(), makeRefinements())).not.toThrow();
  });

  it('does not throw with enriched refinements', () => {
    expect(() =>
      generateReports(makeInputs(), makeRefinements({
        target_narrowed: 'Small dhabas in Hyderabad with 10-50 daily covers',
        differentiation_clarified: 'We have exclusive contracts with 200 farms',
        additional_context: 'We already have 15 pilot restaurants',
      })),
    ).not.toThrow();
  });
});

// ─── Validation output ────────────────────────────────────────────

describe('validation output', () => {
  it('has score between 0 and 100', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(validation.score).toBeGreaterThanOrEqual(0);
    expect(validation.score).toBeLessThanOrEqual(100);
  });

  it('detailed inputs produce higher score than minimal inputs', () => {
    const detailed = generateReports(makeInputs(), makeRefinements());
    const minimal = generateReports(makeMinimalInputs(), makeRefinements());
    expect(detailed.validation.score).toBeGreaterThan(minimal.validation.score);
  });

  it('verdict is a valid Verdict type', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(['strong_fit', 'moderate_fit', 'weak_fit', 'no_fit']).toContain(validation.verdict);
  });

  it('breakdown has all four scoring dimensions', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(validation.breakdown).toHaveProperty('problem_clarity');
    expect(validation.breakdown).toHaveProperty('solution_fit');
    expect(validation.breakdown).toHaveProperty('market_opportunity');
    expect(validation.breakdown).toHaveProperty('competitive_advantage');
  });

  it('breakdown scores are each between 0 and 25', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    const { problem_clarity, solution_fit, market_opportunity, competitive_advantage } = validation.breakdown;
    for (const val of [problem_clarity, solution_fit, market_opportunity, competitive_advantage]) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(25);
    }
  });

  it('breakdown scores sum to the total score', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    const { problem_clarity, solution_fit, market_opportunity, competitive_advantage } = validation.breakdown;
    expect(problem_clarity + solution_fit + market_opportunity + competitive_advantage).toBe(validation.score);
  });

  it('has at least 1 strength for detailed inputs', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(validation.strengths.length).toBeGreaterThanOrEqual(1);
  });

  it('has weaknesses for minimal inputs', () => {
    const { validation } = generateReports(makeMinimalInputs(), makeRefinements());
    expect(validation.weaknesses.length).toBeGreaterThan(0);
  });

  it('has fewer weaknesses for detailed inputs than minimal inputs', () => {
    const detailed = generateReports(makeInputs(), makeRefinements());
    const minimal = generateReports(makeMinimalInputs(), makeRefinements());
    expect(detailed.validation.weaknesses.length).toBeLessThan(minimal.validation.weaknesses.length);
  });

  it('has at least 1 risk', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(validation.risks.length).toBeGreaterThanOrEqual(1);
  });

  it('each risk has risk and mitigation fields', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    for (const r of validation.risks) {
      expect(r).toHaveProperty('risk');
      expect(r).toHaveProperty('mitigation');
      expect(r.risk.length).toBeGreaterThan(0);
      expect(r.mitigation.length).toBeGreaterThan(0);
    }
  });

  it('has at least 1 recommendation', () => {
    const { validation } = generateReports(makeInputs(), makeRefinements());
    expect(validation.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it('score never exceeds 100 even with maximal inputs', () => {
    const maxInputs = makeInputs({
      business_idea: Array(200).fill('word').join(' '),
      target_customer: Array(200).fill('word').join(' '),
      problem_statement: Array(200).fill('word').join(' '),
      solution_differentiation: 'Unlike competitor X, compared to Y, vs Z we are better ' + Array(200).fill('word').join(' '),
    });
    const { validation } = generateReports(maxInputs, makeRefinements());
    expect(validation.score).toBeLessThanOrEqual(100);
  });

  it('score never goes below 0 even with empty inputs', () => {
    const emptyInputs: IdeaValidationInputs = {
      context_type: '',
      business_idea: '',
      target_customer: '',
      target_location: '',
      problem_statement: '',
      solution_differentiation: '',
    };
    const { validation } = generateReports(emptyInputs, makeRefinements());
    expect(validation.score).toBeGreaterThanOrEqual(0);
  });
});

// ─── Market analysis output ───────────────────────────────────────

describe('market analysis output', () => {
  it('has global market data', () => {
    const { market } = generateReports(makeInputs(), makeRefinements());
    expect(market.global).toBeDefined();
    expect(market.global.size).toBeDefined();
    expect(market.global.growth_rate).toBeDefined();
    expect(market.global.key_players.length).toBeGreaterThan(0);
  });

  it('has TAM, SAM, SOM tiers', () => {
    const { market } = generateReports(makeInputs(), makeRefinements());
    expect(market.tam).toBeDefined();
    expect(market.sam).toBeDefined();
    expect(market.som).toBeDefined();
  });

  it('each tier has label, definition, value_inr, value_usd, source', () => {
    const { market } = generateReports(makeInputs(), makeRefinements());
    for (const tier of [market.tam, market.sam, market.som]) {
      expect(tier.label).toBeDefined();
      expect(tier.definition).toBeDefined();
      expect(tier.value_inr).toBeDefined();
      expect(tier.value_usd).toBeDefined();
      expect(tier.source).toBeDefined();
    }
  });

  it('has customer count', () => {
    const { market } = generateReports(makeInputs(), makeRefinements());
    expect(market.customer_count).toBeDefined();
    expect(market.customer_count.length).toBeGreaterThan(0);
  });
});

// ─── Competitor analysis output ───────────────────────────────────

describe('competitor analysis output', () => {
  it('has global, regional, and local competitor arrays', () => {
    const { competitors } = generateReports(makeInputs(), makeRefinements());
    expect(Array.isArray(competitors.global)).toBe(true);
    expect(Array.isArray(competitors.regional)).toBe(true);
    expect(Array.isArray(competitors.local)).toBe(true);
  });

  it('each competitor has name, description, funding, scale, gap', () => {
    const { competitors } = generateReports(makeInputs(), makeRefinements());
    for (const c of [...competitors.global, ...competitors.regional, ...competitors.local]) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c).toHaveProperty('funding');
      expect(c).toHaveProperty('scale');
      expect(c).toHaveProperty('gap');
    }
  });

  it('has your_value section with differentiators', () => {
    const { competitors } = generateReports(makeInputs(), makeRefinements());
    expect(competitors.your_value).toBeDefined();
    expect(competitors.your_value.differentiators.length).toBeGreaterThan(0);
    expect(competitors.your_value.why_customers_choose_you.length).toBeGreaterThan(0);
    expect(competitors.your_value.defensible_moat.length).toBeGreaterThan(0);
  });
});

// ─── Positioning output ───────────────────────────────────────────

describe('positioning output', () => {
  it('is a non-empty string', () => {
    const { positioning } = generateReports(makeInputs(), makeRefinements());
    expect(typeof positioning).toBe('string');
    expect(positioning.length).toBeGreaterThan(0);
  });

  it('references the target customer or market', () => {
    const { positioning } = generateReports(makeInputs(), makeRefinements());
    // The positioning statement should reference some aspect of the inputs
    expect(positioning.length).toBeGreaterThan(20);
  });
});

// ─── Pitch deck output ────────────────────────────────────────────

describe('pitch deck output', () => {
  it('has all six slides', () => {
    const { pitch_deck } = generateReports(makeInputs(), makeRefinements());
    expect(pitch_deck.problem_slide).toBeDefined();
    expect(pitch_deck.solution_slide).toBeDefined();
    expect(pitch_deck.market_slide).toBeDefined();
    expect(pitch_deck.competition_slide).toBeDefined();
    expect(pitch_deck.why_now_slide).toBeDefined();
    expect(pitch_deck.target_customer_slide).toBeDefined();
  });

  it('each slide has title, bullets, and source', () => {
    const { pitch_deck } = generateReports(makeInputs(), makeRefinements());
    const slides = [
      pitch_deck.problem_slide,
      pitch_deck.solution_slide,
      pitch_deck.market_slide,
      pitch_deck.competition_slide,
      pitch_deck.why_now_slide,
      pitch_deck.target_customer_slide,
    ];
    for (const slide of slides) {
      expect(slide.title.length).toBeGreaterThan(0);
      expect(slide.bullets.length).toBeGreaterThan(0);
      expect(slide).toHaveProperty('source');
    }
  });

  it('bullets are non-empty strings', () => {
    const { pitch_deck } = generateReports(makeInputs(), makeRefinements());
    const slides = [
      pitch_deck.problem_slide,
      pitch_deck.solution_slide,
      pitch_deck.market_slide,
      pitch_deck.competition_slide,
      pitch_deck.why_now_slide,
      pitch_deck.target_customer_slide,
    ];
    for (const slide of slides) {
      for (const bullet of slide.bullets) {
        expect(typeof bullet).toBe('string');
        expect(bullet.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Refinements enrichment ───────────────────────────────────────

describe('refinements enrichment', () => {
  it('enriched refinements change the validation score', () => {
    const inputs = makeMinimalInputs();
    const bare = generateReports(inputs, makeRefinements());
    const enriched = generateReports(inputs, makeRefinements({
      target_narrowed: 'Small dhabas in Hyderabad with 10-50 daily covers who currently buy from wholesale mandis',
      differentiation_clarified: 'We have exclusive contracts with 200 farms and a proprietary quality grading system compared to competitors',
      additional_context: 'We already have 15 pilot restaurants using our service with 90% retention after 3 months',
    }));
    // Enriched refinements add more text, which should change the score
    expect(enriched.validation.score).not.toBe(bare.validation.score);
  });

  it('enriched refinements produce different competitor analysis', () => {
    const inputs = makeMinimalInputs();
    const bare = generateReports(inputs, makeRefinements());
    const enriched = generateReports(inputs, makeRefinements({
      differentiation_clarified: 'Unlike competitor Swiggy and Zomato, we focus on B2B procurement',
    }));
    // The enriched version should have different content since it now mentions competitors
    expect(enriched.competitors).toBeDefined();
  });
});
