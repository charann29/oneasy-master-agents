import type { IdeaValidationInputs } from '../_types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConversationQuestion {
  category: string;
  question: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '...';
}

// ---------------------------------------------------------------------------
// Initial summary
// ---------------------------------------------------------------------------

/**
 * Generate the initial AI summary message referencing the user's inputs.
 * Displayed at the start of Phase 2 conversation.
 */
export function getInitialSummary(inputs: IdeaValidationInputs): string {
  const contextLabel =
    inputs.context_type === 'new_idea'
      ? 'new idea'
      : inputs.context_type === 'existing_business'
        ? 'existing business'
        : inputs.context_type === 'new_product'
          ? 'new product'
          : inputs.context_type === 'pivot'
            ? 'pivot'
            : 'idea';

  return (
    `I've completed my initial analysis of your **${contextLabel}** idea. Here's what I found so far:\n\n` +
    `**Business Idea:** ${inputs.business_idea || 'Your concept'}\n` +
    `**Target Market:** ${inputs.target_customer || 'Not specified'} in ${inputs.target_location || 'your chosen market'}\n` +
    `**Core Problem:** ${inputs.problem_statement ? truncate(inputs.problem_statement, 120) : 'Not specified'}\n\n` +
    `I've identified some promising market signals and a few areas that need deeper exploration. I have a few questions to refine my analysis...`
  );
}

// ---------------------------------------------------------------------------
// Clarifying questions
// ---------------------------------------------------------------------------

/**
 * Return an ordered list of clarifying questions based on input analysis.
 * The AnalysisChat component picks from these sequentially, skipping
 * categories that the user already covered well in their Phase 1 answers.
 */
export function getClarifyingQuestions(inputs: IdeaValidationInputs): ConversationQuestion[] {
  const questions: ConversationQuestion[] = [];

  // Target audience breadth
  if (wordCount(inputs.target_customer) < 50) {
    questions.push({
      category: 'target_audience',
      question:
        `You mentioned your target customers are **"${inputs.target_customer}"**. ` +
        `Can you narrow that down a bit more? For example, what specific segment within ` +
        `that group would be your ideal early adopters — think demographics, behaviors, ` +
        `or pain intensity. The more specific, the sharper our analysis will be.`,
    });
  }

  // Competitor mentions
  const solLower = inputs.solution_differentiation.toLowerCase();
  if (
    !solLower.includes('competitor') &&
    !solLower.includes('vs') &&
    !solLower.includes('compared')
  ) {
    questions.push({
      category: 'competitors',
      question:
        `I want to map your competitive landscape accurately. Who do you see as your ` +
        `**top 2-3 competitors** (direct or indirect) in ${inputs.target_location || 'your target market'}? ` +
        `And what specifically makes your approach different from theirs?`,
    });
  }

  // Validation evidence
  const probLower = inputs.problem_statement.toLowerCase();
  if (
    !probLower.includes('interview') &&
    !probLower.includes('talk') &&
    !probLower.includes('survey') &&
    !probLower.includes('validat')
  ) {
    questions.push({
      category: 'validation',
      question:
        `Have you had any conversations with potential customers about this problem? ` +
        `Even informal chats count — I'm looking for any early signals like people saying ` +
        `"I'd pay for that" or showing strong interest. If yes, roughly how many people ` +
        `have you spoken with?`,
    });
  }

  // Differentiation / unfair advantage (always asked as a catch-all)
  questions.push({
    category: 'unfair_advantage',
    question:
      `What's your **unfair advantage** here? This could be domain expertise, unique ` +
      `relationships, proprietary tech, or a personal experience that gives you a unique ` +
      `insight into this problem. What makes *you* the right person or team to build this?`,
  });

  return questions;
}

// ---------------------------------------------------------------------------
// Final summary
// ---------------------------------------------------------------------------

/**
 * Generate the final "I have everything I need" summary before transitioning
 * to Phase 3 report generation.
 */
export function getFinalSummary(inputs: IdeaValidationInputs): string {
  return (
    `Excellent! I now have a comprehensive understanding of your idea. Here's what I've captured:\n\n` +
    `✓ **Business concept:** ${inputs.business_idea || 'Your idea'}\n` +
    `✓ **Target market:** ${inputs.target_customer || 'Your target audience'} in ${inputs.target_location || 'your market'}\n` +
    `✓ **Key problem:** ${inputs.problem_statement ? truncate(inputs.problem_statement, 80) : 'As described'}\n` +
    `✓ **Differentiation:** ${inputs.solution_differentiation ? truncate(inputs.solution_differentiation, 80) : 'As described'}\n` +
    `✓ **Refined insights from our conversation**\n\n` +
    `Generating your detailed reports now...`
  );
}
