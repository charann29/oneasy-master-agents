export type ContextType = 'new_idea' | 'existing_business' | 'new_product' | 'pivot';

export interface IdeaValidationInputs {
  context_type: ContextType | '';
  business_idea: string;
  target_customer: string;
  target_location: string;
  problem_statement: string;
  solution_differentiation: string;
}

export interface ValidationEvidence {
  interviews: number;
  confirmed_interest: number;
  beta_testers: number;
}

export interface Refinements {
  target_narrowed: string;
  differentiation_clarified: string;
  validation_evidence: ValidationEvidence;
  additional_context: string;
}

export interface ScoreBreakdown {
  problem_clarity: number;       // out of 25
  solution_fit: number;          // out of 25
  market_opportunity: number;    // out of 25
  competitive_advantage: number; // out of 25
}

export type Verdict = 'strong_fit' | 'moderate_fit' | 'weak_fit' | 'no_fit';

export interface ValidationOutput {
  score: number;               // out of 100
  breakdown: ScoreBreakdown;
  verdict: Verdict;
  strengths: string[];
  weaknesses: string[];
  risks: { risk: string; mitigation: string }[];
  recommendations: string[];
}

export interface MarketTier {
  label: string;
  definition: string;
  value_inr: string;
  value_usd: string;
  source: string;
}

export interface GlobalMarket {
  size: string;
  growth_rate: string;
  key_players: string[];
}

export interface MarketAnalysis {
  global: GlobalMarket;
  tam: MarketTier;
  sam: MarketTier;
  som: MarketTier;
  customer_count: string;
}

export interface Competitor {
  name: string;
  description: string;
  funding: string;
  scale: string;
  gap: string;
}

export interface CompetitorAnalysis {
  global: Competitor[];
  regional: Competitor[];
  local: Competitor[];
  your_value: {
    differentiators: string[];
    why_customers_choose_you: string;
    defensible_moat: string;
  };
}

export interface SlideContent {
  title: string;
  bullets: string[];
  source: string;
}

export interface PitchDeckOutput {
  problem_slide: SlideContent;
  solution_slide: SlideContent;
  market_slide: SlideContent;
  competition_slide: SlideContent;
  why_now_slide: SlideContent;
  target_customer_slide: SlideContent;
}

export interface AllOutputs {
  validation: ValidationOutput;
  market: MarketAnalysis;
  competitors: CompetitorAnalysis;
  positioning: string;
  pitch_deck: PitchDeckOutput;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface IdeaValidationState {
  inputs: IdeaValidationInputs;
  refinements: Refinements;
  outputs: AllOutputs | null;
  currentPhase: 1 | 2 | 3;
  currentStep: number; // 1-5 for Phase 1
  chatMessages: ChatMessage[];
  isAnalysisComplete: boolean;
}
