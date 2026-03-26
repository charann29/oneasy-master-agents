import { describe, it, expect } from 'vitest';
import {
  getInitialSummary,
  getClarifyingQuestions,
  getFinalSummary,
} from '../conversationEngine';
import type { IdeaValidationInputs } from '../../_types';

function makeInputs(overrides: Partial<IdeaValidationInputs> = {}): IdeaValidationInputs {
  return {
    context_type: 'new_idea',
    business_idea: 'A mobile app for food delivery',
    target_customer: 'Restaurant owners in Hyderabad',
    target_location: 'Hyderabad, India',
    problem_statement: 'Restaurants lose money to middlemen',
    solution_differentiation: 'Direct farm to kitchen marketplace',
    ...overrides,
  };
}

// ─── getInitialSummary ────────────────────────────────────────────

describe('getInitialSummary', () => {
  it('includes the context type label', () => {
    const summary = getInitialSummary(makeInputs({ context_type: 'new_idea' }));
    expect(summary).toContain('new idea');
  });

  it('includes the business idea', () => {
    const summary = getInitialSummary(makeInputs({ business_idea: 'FarmConnect app' }));
    expect(summary).toContain('FarmConnect app');
  });

  it('includes the target location', () => {
    const summary = getInitialSummary(makeInputs({ target_location: 'Mumbai' }));
    expect(summary).toContain('Mumbai');
  });

  it('includes the target customer', () => {
    const summary = getInitialSummary(makeInputs({ target_customer: 'Small restaurants' }));
    expect(summary).toContain('Small restaurants');
  });

  it('truncates long problem statements', () => {
    const longProblem = 'A'.repeat(200);
    const summary = getInitialSummary(makeInputs({ problem_statement: longProblem }));
    expect(summary).toContain('...');
  });

  it('handles empty inputs gracefully', () => {
    const summary = getInitialSummary(makeInputs({
      business_idea: '',
      target_customer: '',
      target_location: '',
      problem_statement: '',
    }));
    expect(summary).toContain('Your concept');
    expect(summary).toContain('Not specified');
  });

  it('handles all context types', () => {
    expect(getInitialSummary(makeInputs({ context_type: 'existing_business' }))).toContain('existing business');
    expect(getInitialSummary(makeInputs({ context_type: 'new_product' }))).toContain('new product');
    expect(getInitialSummary(makeInputs({ context_type: 'pivot' }))).toContain('pivot');
    expect(getInitialSummary(makeInputs({ context_type: '' }))).toContain('idea');
  });
});

// ─── getClarifyingQuestions ───────────────────────────────────────

describe('getClarifyingQuestions', () => {
  it('asks about target audience when target_customer is short', () => {
    const questions = getClarifyingQuestions(makeInputs({ target_customer: 'restaurants' }));
    const categories = questions.map((q) => q.category);
    expect(categories).toContain('target_audience');
  });

  it('does NOT ask about target audience when target_customer is detailed', () => {
    const longTarget = Array(60).fill('word').join(' ');
    const questions = getClarifyingQuestions(makeInputs({ target_customer: longTarget }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('target_audience');
  });

  it('asks about competitors when solution does not mention them', () => {
    const questions = getClarifyingQuestions(makeInputs({
      solution_differentiation: 'We build a great product',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).toContain('competitors');
  });

  it('does NOT ask about competitors when solution mentions "competitor"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      solution_differentiation: 'Unlike our competitor Ninjacart, we do X',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('competitors');
  });

  it('does NOT ask about competitors when solution mentions "vs"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      solution_differentiation: 'vs Ninjacart we are faster',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('competitors');
  });

  it('does NOT ask about competitors when solution mentions "compared"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      solution_differentiation: 'compared to Ninjacart we are faster',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('competitors');
  });

  it('asks about validation when problem does not mention interviews', () => {
    const questions = getClarifyingQuestions(makeInputs({
      problem_statement: 'People lose money to middlemen',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).toContain('validation');
  });

  it('does NOT ask about validation when problem mentions "interview"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      problem_statement: 'Based on interview data, people lose money',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('validation');
  });

  it('does NOT ask about validation when problem mentions "survey"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      problem_statement: 'Our survey shows people lose money',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('validation');
  });

  it('does NOT ask about validation when problem mentions "talk"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      problem_statement: 'After we talk to customers, they confirmed the issue',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('validation');
  });

  it('does NOT ask about validation when problem mentions "validat"', () => {
    const questions = getClarifyingQuestions(makeInputs({
      problem_statement: 'We validated this through customer research',
    }));
    const categories = questions.map((q) => q.category);
    expect(categories).not.toContain('validation');
  });

  it('always includes unfair_advantage question', () => {
    const questions = getClarifyingQuestions(makeInputs());
    const categories = questions.map((q) => q.category);
    expect(categories).toContain('unfair_advantage');
  });

  it('returns at least 1 question', () => {
    const questions = getClarifyingQuestions(makeInputs());
    expect(questions.length).toBeGreaterThanOrEqual(1);
  });

  it('includes location in competitor question', () => {
    const questions = getClarifyingQuestions(makeInputs({
      target_location: 'Chennai',
      solution_differentiation: 'We are great',
    }));
    const competitorQ = questions.find((q) => q.category === 'competitors');
    expect(competitorQ?.question).toContain('Chennai');
  });

  it('each question has category and question text', () => {
    const questions = getClarifyingQuestions(makeInputs());
    for (const q of questions) {
      expect(q.category.length).toBeGreaterThan(0);
      expect(q.question.length).toBeGreaterThan(0);
    }
  });
});

// ─── getFinalSummary ──────────────────────────────────────────────

describe('getFinalSummary', () => {
  it('includes business idea', () => {
    const summary = getFinalSummary(makeInputs({ business_idea: 'FarmConnect' }));
    expect(summary).toContain('FarmConnect');
  });

  it('includes target customer and location', () => {
    const summary = getFinalSummary(makeInputs({
      target_customer: 'Restaurant owners',
      target_location: 'Hyderabad',
    }));
    expect(summary).toContain('Restaurant owners');
    expect(summary).toContain('Hyderabad');
  });

  it('includes checkmark symbols', () => {
    const summary = getFinalSummary(makeInputs());
    expect(summary).toContain('✓');
  });

  it('includes "Generating" message', () => {
    const summary = getFinalSummary(makeInputs());
    expect(summary).toContain('Generating your detailed reports');
  });

  it('handles empty inputs gracefully', () => {
    const summary = getFinalSummary(makeInputs({
      business_idea: '',
      target_customer: '',
      target_location: '',
      problem_statement: '',
      solution_differentiation: '',
    }));
    expect(summary).toContain('Your idea');
    expect(summary).toContain('As described');
  });
});
