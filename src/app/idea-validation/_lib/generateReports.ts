import type {
  IdeaValidationInputs,
  Refinements,
  AllOutputs,
  ValidationOutput,
  MarketAnalysis,
  CompetitorAnalysis,
  PitchDeckOutput,
  Verdict,
  ScoreBreakdown,
  Competitor,
  MarketTier,
  GlobalMarket,
  SlideContent,
} from '../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function hasNumbers(s: string): boolean {
  return /\d+/.test(s);
}

function hasCompetitorMention(s: string): boolean {
  const lower = s.toLowerCase();
  return (
    lower.includes('unlike') ||
    lower.includes('different from') ||
    lower.includes('competitor') ||
    lower.includes('compared') ||
    lower.includes('vs')
  );
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function extractCompanyName(businessIdea: string): string {
  // Try to find a company name — look for capitalized words at the start
  const match = businessIdea.match(/^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)/);
  if (match && match[1].length <= 30) return match[1];
  return 'Your Company';
}

// ---------------------------------------------------------------------------
// Industry detection
// ---------------------------------------------------------------------------

interface IndustryData {
  label: string;
  globalSize: string;
  tamInr: string;
  samInr: string;
  somInr: string;
  tamUsd: string;
  samUsd: string;
  somUsd: string;
  growthRate: string;
  keyPlayers: string[];
  trends: string[];
  globalCompetitors: Competitor[];
  regionalCompetitors: Competitor[];
  localCompetitors: Competitor[];
}

const industryMap: Record<string, IndustryData> = {
  tech: {
    label: 'Technology / SaaS',
    globalSize: '$800B',
    tamInr: '₹50,000 Cr',
    samInr: '₹5,000 Cr',
    somInr: '₹500 Cr',
    tamUsd: '$60B',
    samUsd: '$6B',
    somUsd: '$600M',
    growthRate: '18.5% CAGR (2024-2030)',
    keyPlayers: ['Microsoft', 'Salesforce', 'Google Cloud', 'AWS'],
    trends: [
      'AI/ML integration becoming table stakes across SaaS products',
      'Vertical-specific SaaS solutions outgrowing horizontal platforms',
      'Product-led growth replacing traditional enterprise sales motions',
    ],
    globalCompetitors: [
      { name: 'TechNova Solutions', description: 'Enterprise SaaS platform for workflow automation', funding: '$120M Series C', scale: '500K+ users globally', gap: 'Complex onboarding, not designed for SMBs' },
      { name: 'CloudPeak Systems', description: 'Cloud-native business intelligence suite', funding: '$85M Series B', scale: '200K+ enterprise clients', gap: 'High pricing, limited customization for niche verticals' },
    ],
    regionalCompetitors: [
      { name: 'Zoho Corporation', description: 'Comprehensive business software suite', funding: 'Bootstrapped, $1B+ revenue', scale: '80M+ users', gap: 'Wide but shallow — lacks depth in specialized workflows' },
      { name: 'Freshworks', description: 'Customer engagement and IT solutions', funding: '$400M+ total raised', scale: '60K+ customers', gap: 'Primarily mid-market, limited enterprise features' },
    ],
    localCompetitors: [
      { name: 'NexGen Digital', description: 'Local SaaS provider for business management', funding: 'Seed stage, ₹5 Cr', scale: '2K+ local businesses', gap: 'Limited feature set, basic UI/UX' },
      { name: 'SmartOps India', description: 'Operations management for Indian SMEs', funding: 'Pre-Series A, ₹10 Cr', scale: '5K+ users', gap: 'No mobile-first approach, legacy architecture' },
    ],
  },
  food: {
    label: 'Food & FoodTech',
    globalSize: '$350B',
    tamInr: '₹25,000 Cr',
    samInr: '₹3,000 Cr',
    somInr: '₹300 Cr',
    tamUsd: '$30B',
    samUsd: '$3.6B',
    somUsd: '$360M',
    growthRate: '15.2% CAGR (2024-2030)',
    keyPlayers: ['DoorDash', 'Uber Eats', 'Deliveroo', 'Just Eat'],
    trends: [
      'Cloud kitchens reducing overhead for restaurant entrepreneurs',
      'Health-conscious and plant-based food demand surging 25% YoY',
      'Hyper-local delivery under 15 minutes becoming the new standard',
    ],
    globalCompetitors: [
      { name: 'FoodFlow Global', description: 'AI-powered food supply chain platform', funding: '$95M Series B', scale: '100K+ restaurants', gap: 'Focus on logistics, not customer experience' },
      { name: 'MealCraft Technologies', description: 'Personalized meal planning and delivery', funding: '$60M Series B', scale: '1M+ subscribers', gap: 'Subscription fatigue, limited regional cuisine options' },
    ],
    regionalCompetitors: [
      { name: 'Swiggy', description: 'Leading food delivery and quick commerce platform', funding: '$3.6B+ raised', scale: '500+ cities in India', gap: 'High commission rates for restaurants, thin margins' },
      { name: 'Zomato', description: 'Food delivery, dining out, and grocery', funding: 'Public (NSE listed)', scale: '800+ cities', gap: 'Restaurant discovery declining, heavy reliance on delivery' },
    ],
    localCompetitors: [
      { name: 'LocalBites', description: 'Hyperlocal food discovery and ordering', funding: 'Angel round, ₹2 Cr', scale: '500+ restaurants in metro', gap: 'Limited delivery infrastructure' },
      { name: 'FreshKart', description: 'Farm-to-table fresh food delivery', funding: 'Seed, ₹4 Cr', scale: '10K+ orders/month', gap: 'Narrow product range, inconsistent quality' },
    ],
  },
  healthcare: {
    label: 'Healthcare & HealthTech',
    globalSize: '$600B',
    tamInr: '₹40,000 Cr',
    samInr: '₹4,000 Cr',
    somInr: '₹400 Cr',
    tamUsd: '$48B',
    samUsd: '$4.8B',
    somUsd: '$480M',
    growthRate: '21.3% CAGR (2024-2030)',
    keyPlayers: ['Teladoc Health', 'Amwell', 'Babylon Health', 'Oscar Health'],
    trends: [
      'Telehealth adoption permanently elevated post-pandemic',
      'AI-powered diagnostics receiving regulatory approvals globally',
      'Mental health platforms seeing 3x growth in user engagement',
    ],
    globalCompetitors: [
      { name: 'HealthBridge AI', description: 'AI-powered clinical decision support', funding: '$150M Series C', scale: '2K+ hospitals', gap: 'Enterprise only, not accessible for individual practitioners' },
      { name: 'MedConnect Global', description: 'Telemedicine platform for cross-border consultations', funding: '$80M Series B', scale: '5M+ consultations', gap: 'Language barriers, limited specialist network in tier-2 markets' },
    ],
    regionalCompetitors: [
      { name: 'Practo', description: 'Doctor discovery, teleconsultation, and health records', funding: '$230M+ raised', scale: '25M+ users', gap: 'Monetization challenges, doctor engagement declining' },
      { name: '1mg (Tata Health)', description: 'Online pharmacy and health platform', funding: 'Acquired by Tata', scale: '30M+ users', gap: 'Pharmacy-centric, weak on preventive health' },
    ],
    localCompetitors: [
      { name: 'CareFirst Clinics', description: 'Chain of affordable primary care clinics', funding: 'Series A, ₹15 Cr', scale: '50+ clinics', gap: 'Offline only, no digital patient engagement' },
      { name: 'WellnessHub', description: 'Local wellness and preventive health app', funding: 'Pre-seed, ₹1 Cr', scale: '5K+ users', gap: 'Limited medical expertise, content-only model' },
    ],
  },
  education: {
    label: 'Education & EdTech',
    globalSize: '$400B',
    tamInr: '₹30,000 Cr',
    samInr: '₹3,500 Cr',
    somInr: '₹350 Cr',
    tamUsd: '$36B',
    samUsd: '$4.2B',
    somUsd: '$420M',
    growthRate: '16.8% CAGR (2024-2030)',
    keyPlayers: ['Coursera', 'Udemy', 'Duolingo', 'Khan Academy'],
    trends: [
      'Micro-credentials and skill-based certifications replacing traditional degrees',
      'AI tutors providing personalized learning paths at scale',
      'Cohort-based learning models driving 40% higher completion rates',
    ],
    globalCompetitors: [
      { name: 'LearnPath AI', description: 'Adaptive learning platform for K-12', funding: '$110M Series C', scale: '10M+ students', gap: 'US-centric curriculum, poor localization' },
      { name: 'SkillForge', description: 'Professional upskilling with live mentors', funding: '$70M Series B', scale: '2M+ learners', gap: 'Expensive per-learner costs, limited scale' },
    ],
    regionalCompetitors: [
      { name: 'Unacademy', description: 'Test prep and competitive exam platform', funding: '$860M+ raised', scale: '60M+ registered users', gap: 'Exam-focused only, high customer acquisition cost' },
      { name: 'Physics Wallah', description: 'Affordable education for competitive exams', funding: '$300M+ raised', scale: '35M+ users', gap: 'Heavy reliance on founder brand, scaling challenges' },
    ],
    localCompetitors: [
      { name: 'EduSpark Academy', description: 'Local tutoring and coaching center', funding: 'Self-funded', scale: '2K+ students', gap: 'No technology platform, limited geographic reach' },
      { name: 'SkillUp Local', description: 'Vocational training for local job market', funding: 'Grant-funded, ₹50L', scale: '500+ graduates', gap: 'Outdated curriculum, no placement guarantees' },
    ],
  },
  fintech: {
    label: 'Fintech & Financial Services',
    globalSize: '$500B',
    tamInr: '₹35,000 Cr',
    samInr: '₹4,000 Cr',
    somInr: '₹400 Cr',
    tamUsd: '$42B',
    samUsd: '$4.8B',
    somUsd: '$480M',
    growthRate: '23.1% CAGR (2024-2030)',
    keyPlayers: ['Stripe', 'Square', 'Revolut', 'Plaid'],
    trends: [
      'Embedded finance turning every company into a fintech company',
      'UPI and real-time payment systems driving cashless adoption at unprecedented scale',
      'AI-powered credit scoring expanding access for underserved populations',
    ],
    globalCompetitors: [
      { name: 'PayStream Global', description: 'Cross-border payment infrastructure', funding: '$200M Series D', scale: '50K+ merchants', gap: 'High transaction fees for small businesses' },
      { name: 'WealthNest', description: 'Automated wealth management for millennials', funding: '$90M Series B', scale: '3M+ users', gap: 'Limited investment options in emerging markets' },
    ],
    regionalCompetitors: [
      { name: 'Razorpay', description: 'Full-stack payment and banking platform', funding: '$740M+ raised', scale: '10M+ businesses', gap: 'Payment focused, limited lending products' },
      { name: 'CRED', description: 'Credit card management and rewards', funding: '$800M+ raised', scale: '12M+ users', gap: 'Premium-only audience, high burn rate' },
    ],
    localCompetitors: [
      { name: 'QuickLend', description: 'Instant personal loans for salaried professionals', funding: 'Series A, ₹20 Cr', scale: '50K+ borrowers', gap: 'High interest rates, limited product range' },
      { name: 'MoneyMate', description: 'Personal finance tracker and advisor', funding: 'Seed, ₹3 Cr', scale: '20K+ users', gap: 'Basic feature set, no transaction capabilities' },
    ],
  },
  ecommerce: {
    label: 'E-commerce & Retail',
    globalSize: '$700B',
    tamInr: '₹45,000 Cr',
    samInr: '₹5,000 Cr',
    somInr: '₹500 Cr',
    tamUsd: '$54B',
    samUsd: '$6B',
    somUsd: '$600M',
    growthRate: '17.4% CAGR (2024-2030)',
    keyPlayers: ['Amazon', 'Shopify', 'Alibaba', 'Mercado Libre'],
    trends: [
      'Social commerce and live shopping driving 35% of new e-commerce growth',
      'D2C brands bypassing marketplaces with community-led acquisition',
      'Quick commerce (sub-30 min delivery) reshaping consumer expectations',
    ],
    globalCompetitors: [
      { name: 'ShopGlobal', description: 'Cross-border D2C enablement platform', funding: '$130M Series C', scale: '100K+ merchants', gap: 'Complex setup, not suited for first-time sellers' },
      { name: 'CartGenius', description: 'AI-powered e-commerce optimization suite', funding: '$55M Series B', scale: '30K+ stores', gap: 'Enterprise pricing, overkill for small brands' },
    ],
    regionalCompetitors: [
      { name: 'Meesho', description: 'Social commerce platform for small businesses', funding: '$1.1B+ raised', scale: '150M+ users', gap: 'Low-value transactions, quality perception issues' },
      { name: 'Flipkart', description: 'Dominant Indian e-commerce marketplace', funding: 'Walmart-owned', scale: '400M+ users', gap: 'Marketplace model limits brand control, high competition' },
    ],
    localCompetitors: [
      { name: 'LocalShop Online', description: 'Digitizing neighborhood retail stores', funding: 'Angel round, ₹1.5 Cr', scale: '1K+ stores', gap: 'Limited tech infrastructure, small catalog' },
      { name: 'BrandBox', description: 'D2C brand aggregator and accelerator', funding: 'Pre-Series A, ₹8 Cr', scale: '50+ brands', gap: 'Thin margins, dependent on brand partnerships' },
    ],
  },
  default: {
    label: 'General Market',
    globalSize: '$200B',
    tamInr: '₹15,000 Cr',
    samInr: '₹2,000 Cr',
    somInr: '₹200 Cr',
    tamUsd: '$18B',
    samUsd: '$2.4B',
    somUsd: '$240M',
    growthRate: '15.0% CAGR (2024-2030)',
    keyPlayers: ['Industry Leaders', 'Established Players', 'Emerging Disruptors'],
    trends: [
      'Digital transformation accelerating across traditional industries',
      'Sustainability and ESG focus creating new market opportunities',
      'Remote-first business models expanding addressable markets globally',
    ],
    globalCompetitors: [
      { name: 'GlobalReach Corp', description: 'Full-service industry solutions provider', funding: '$100M+ Series C', scale: 'Operates in 30+ countries', gap: 'Slow to innovate, bureaucratic decision-making' },
      { name: 'InnovatePro', description: 'Technology-driven industry disruptor', funding: '$65M Series B', scale: '50K+ business clients', gap: 'Narrow focus area, limited support infrastructure' },
    ],
    regionalCompetitors: [
      { name: 'BharatSolutions', description: 'India-focused industry platform', funding: '$50M Series B', scale: '20K+ businesses', gap: 'India-only, limited tech sophistication' },
      { name: 'NextGen Services', description: 'Digital services for Indian enterprises', funding: '$30M Series A', scale: '10K+ clients', gap: 'Service-heavy model, hard to scale' },
    ],
    localCompetitors: [
      { name: 'CityFirst Solutions', description: 'Local business services provider', funding: 'Bootstrapped, ₹2 Cr', scale: '500+ clients', gap: 'Offline-first, no technology moat' },
      { name: 'QuickStart Local', description: 'Small business enablement platform', funding: 'Seed, ₹1 Cr', scale: '200+ businesses', gap: 'Early stage, limited features' },
    ],
  },
};

function detectIndustry(businessIdea: string, problemStatement: string): IndustryData {
  const text = `${businessIdea} ${problemStatement}`.toLowerCase();

  const keywords: Record<string, string[]> = {
    tech: ['saas', 'software', 'tech', 'app', 'platform', 'api', 'cloud', 'automation', 'ai', 'machine learning', 'digital tool'],
    food: ['food', 'restaurant', 'meal', 'recipe', 'kitchen', 'delivery', 'grocery', 'cook', 'dining', 'foodtech', 'catering'],
    healthcare: ['health', 'medical', 'doctor', 'patient', 'hospital', 'clinic', 'wellness', 'therapy', 'pharma', 'diagnostic', 'mental health', 'telemedicine'],
    education: ['education', 'learn', 'course', 'student', 'teach', 'school', 'university', 'tutor', 'edtech', 'training', 'skill', 'upskill'],
    fintech: ['fintech', 'finance', 'payment', 'bank', 'loan', 'invest', 'insurance', 'credit', 'money', 'wallet', 'upi', 'trading'],
    ecommerce: ['ecommerce', 'e-commerce', 'retail', 'shop', 'store', 'marketplace', 'buy', 'sell', 'commerce', 'd2c', 'brand'],
  };

  let bestMatch = 'default';
  let bestScore = 0;

  for (const [industry, words] of Object.entries(keywords)) {
    const score = words.filter((w) => text.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = industry;
    }
  }

  return industryMap[bestMatch] ?? industryMap.default;
}

// ---------------------------------------------------------------------------
// Score calculation
// ---------------------------------------------------------------------------

function calculateScores(inputs: IdeaValidationInputs): ScoreBreakdown {
  // Problem Clarity (out of 25)
  const probWords = wordCount(inputs.problem_statement);
  let problemClarity: number;
  if (probWords < 20) problemClarity = 8;
  else if (probWords < 50) problemClarity = 14;
  else if (probWords < 100) problemClarity = 19;
  else problemClarity = 22;
  if (hasNumbers(inputs.problem_statement)) problemClarity += 3;
  problemClarity = clamp(problemClarity, 0, 25);

  // Solution Fit (out of 25)
  const solWords = wordCount(inputs.solution_differentiation);
  let solutionFit: number;
  if (solWords < 30) solutionFit = 8;
  else if (solWords < 80) solutionFit = 14;
  else if (solWords < 150) solutionFit = 19;
  else solutionFit = 22;
  if (hasCompetitorMention(inputs.solution_differentiation)) solutionFit += 3;
  solutionFit = clamp(solutionFit, 0, 25);

  // Market Opportunity (out of 25)
  const targetWords = wordCount(inputs.target_customer);
  let marketOpportunity: number;
  if (targetWords < 20) marketOpportunity = 10;
  else if (targetWords < 50) marketOpportunity = 15;
  else if (targetWords < 100) marketOpportunity = 20;
  else marketOpportunity = 23;
  if (hasNumbers(inputs.target_customer)) marketOpportunity += 2;
  marketOpportunity = clamp(marketOpportunity, 0, 25);

  // Competitive Advantage (out of 25)
  const diffWords = wordCount(inputs.solution_differentiation);
  let competitiveAdvantage: number;
  if (diffWords < 30) competitiveAdvantage = 8;
  else if (diffWords < 80) competitiveAdvantage = 14;
  else if (diffWords < 150) competitiveAdvantage = 18;
  else competitiveAdvantage = 22;
  if (hasCompetitorMention(inputs.solution_differentiation)) competitiveAdvantage += 3;
  competitiveAdvantage = clamp(competitiveAdvantage, 0, 25);

  return {
    problem_clarity: problemClarity,
    solution_fit: solutionFit,
    market_opportunity: marketOpportunity,
    competitive_advantage: competitiveAdvantage,
  };
}

function getVerdict(score: number): Verdict {
  if (score >= 80) return 'strong_fit';
  if (score >= 60) return 'moderate_fit';
  if (score >= 40) return 'weak_fit';
  return 'no_fit';
}

// ---------------------------------------------------------------------------
// Validation output
// ---------------------------------------------------------------------------

function generateValidation(inputs: IdeaValidationInputs): ValidationOutput {
  const breakdown = calculateScores(inputs);
  const rawScore = breakdown.problem_clarity + breakdown.solution_fit + breakdown.market_opportunity + breakdown.competitive_advantage;
  const score = clamp(rawScore, 0, 100);
  const verdict = getVerdict(score);

  const industry = detectIndustry(inputs.business_idea, inputs.problem_statement);

  // Strengths
  const strengths: string[] = [];
  if (breakdown.problem_clarity >= 17)
    strengths.push(`Clear problem identification in the ${industry.label} space with specific pain points articulated`);
  else
    strengths.push(`Addresses a real problem in the ${industry.label} market that customers experience`);

  if (wordCount(inputs.business_idea) > 30)
    strengths.push('Well-articulated business concept with clear value proposition');
  else
    strengths.push('Concise business idea that communicates the core offering');

  if (inputs.target_location.trim())
    strengths.push(`Defined geographic focus (${inputs.target_location}) enables targeted go-to-market strategy`);

  if (breakdown.solution_fit >= 17)
    strengths.push('Strong solution-market fit with clear differentiation from existing alternatives');

  // Weaknesses
  const weaknesses: string[] = [];
  if (breakdown.market_opportunity < 18)
    weaknesses.push('Target market definition could be more specific — consider narrowing to an ideal customer profile');
  if (breakdown.competitive_advantage < 16)
    weaknesses.push('Competitive differentiation needs strengthening — articulate specific moats');
  if (wordCount(inputs.problem_statement) < 50)
    weaknesses.push('Problem statement could benefit from more data points and customer evidence');
  if (!hasNumbers(inputs.target_customer))
    weaknesses.push('No quantitative market sizing mentioned — add estimated customer counts or spend data');

  // Risks
  const risks: { risk: string; mitigation: string }[] = [
    {
      risk: 'Established competitors may replicate the model once traction is proven',
      mitigation: 'Focus on building strong early customer relationships and network effects that create switching costs',
    },
    {
      risk: `Market timing uncertainty in the ${industry.label} sector`,
      mitigation: 'Validate demand with a minimum viable product before significant investment in scaling',
    },
    {
      risk: 'Customer acquisition costs may be higher than projected in the early stages',
      mitigation: `Develop a community-driven or content-led growth strategy specific to ${inputs.target_location || 'your target market'}`,
    },
  ];

  if (breakdown.problem_clarity < 15) {
    risks.push({
      risk: 'Problem-solution fit may not be validated with enough customer evidence',
      mitigation: 'Conduct structured customer discovery interviews before building further',
    });
  }

  // Recommendations
  const recommendations: string[] = [
    'Conduct 20+ customer interviews to validate willingness to pay and identify key purchase triggers',
    `Build a landing page and run targeted ads in ${inputs.target_location || 'your target market'} to measure demand signals`,
    'Create a competitive positioning map to clearly communicate your unique advantages to investors',
  ];

  if (breakdown.market_opportunity < 18)
    recommendations.push('Define your ideal customer profile with specific demographics, behaviors, and budget range');
  else
    recommendations.push('Develop case studies or testimonials from early design partners to strengthen credibility');

  return {
    score,
    breakdown,
    verdict,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    risks: risks.slice(0, 4),
    recommendations: recommendations.slice(0, 4),
  };
}

// ---------------------------------------------------------------------------
// Market analysis
// ---------------------------------------------------------------------------

function generateMarketAnalysis(inputs: IdeaValidationInputs): MarketAnalysis {
  const industry = detectIndustry(inputs.business_idea, inputs.problem_statement);

  const global: GlobalMarket = {
    size: industry.globalSize,
    growth_rate: industry.growthRate,
    key_players: industry.keyPlayers,
  };

  const tam: MarketTier = {
    label: 'Total Addressable Market (TAM)',
    definition: `The entire ${industry.label} market relevant to your offering`,
    value_inr: industry.tamInr,
    value_usd: industry.tamUsd,
    source: 'Industry Reports 2024, Market Research Analysis',
  };

  const sam: MarketTier = {
    label: 'Serviceable Addressable Market (SAM)',
    definition: `The segment of TAM you can realistically target in ${inputs.target_location || 'your region'} with your current capabilities`,
    value_inr: industry.samInr,
    value_usd: industry.samUsd,
    source: 'Market Research Analysis, Regional Economic Data 2024',
  };

  const som: MarketTier = {
    label: 'Serviceable Obtainable Market (SOM)',
    definition: `The portion of SAM you can capture in the first 2-3 years given resources and competition`,
    value_inr: industry.somInr,
    value_usd: industry.somUsd,
    source: 'Comparable Startup Benchmarks, Market Penetration Analysis',
  };

  // Estimate customer count based on location
  const location = (inputs.target_location || '').toLowerCase();
  let customerCount: string;
  if (location.includes('india') || location.includes('national'))
    customerCount = '50,000 - 200,000 potential customers in your initial target segment';
  else if (location.includes('global') || location.includes('world'))
    customerCount = '500,000 - 2,000,000 potential customers globally in your niche';
  else
    customerCount = '10,000 - 50,000 potential customers in your target geography';

  return { global, tam, sam, som, customer_count: customerCount };
}

// ---------------------------------------------------------------------------
// Competitor analysis
// ---------------------------------------------------------------------------

function generateCompetitorAnalysis(inputs: IdeaValidationInputs): CompetitorAnalysis {
  const industry = detectIndustry(inputs.business_idea, inputs.problem_statement);

  // Check if user mentioned specific competitors — include them
  const userText = `${inputs.solution_differentiation} ${inputs.business_idea}`;
  const mentionedCompetitors: Competitor[] = [];

  // Simple heuristic: find capitalized multi-word names that look like company names
  const competitorPatterns = userText.match(/(?:unlike|vs\.?|compared to|compete with|competitor[s]?\s+(?:like|such as|including))\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)/gi);
  if (competitorPatterns) {
    for (const match of competitorPatterns.slice(0, 2)) {
      const name = match.replace(/^(?:unlike|vs\.?|compared to|compete with|competitor[s]?\s+(?:like|such as|including))\s+/i, '').trim();
      if (name.length > 2) {
        mentionedCompetitors.push({
          name,
          description: `Mentioned in your competitive analysis — direct competitor in your space`,
          funding: 'Details to be researched',
          scale: 'Market presence confirmed',
          gap: 'Opportunity for differentiation based on your unique approach',
        });
      }
    }
  }

  const globalCompetitors = mentionedCompetitors.length > 0
    ? [...mentionedCompetitors.slice(0, 1), ...industry.globalCompetitors.slice(0, 1)]
    : industry.globalCompetitors;

  const regionalCompetitors = industry.regionalCompetitors;
  const localCompetitors = industry.localCompetitors;

  // Extract differentiators
  const differentiators: string[] = [];
  const solSentences = inputs.solution_differentiation.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  for (const sentence of solSentences.slice(0, 3)) {
    differentiators.push(sentence.trim());
  }
  if (differentiators.length === 0) {
    differentiators.push('Unique approach to solving the identified problem');
    differentiators.push('Tailored solution for the target market segment');
  }

  // Why customers choose you
  const whyCustomers = inputs.problem_statement
    ? `Customers choose you because you directly address their pain point: "${inputs.problem_statement.slice(0, 100)}${inputs.problem_statement.length > 100 ? '...' : ''}" — with a solution specifically designed for ${inputs.target_customer || 'your target segment'} in ${inputs.target_location || 'your market'}.`
    : `Customers choose you for your focused approach to solving problems that existing solutions overlook, specifically designed for ${inputs.target_customer || 'your target audience'}.`;

  // Defensible moat
  const defensibleMoat = `Deep understanding of ${inputs.target_customer || 'your target customer'} needs combined with ${
    differentiators[0]?.toLowerCase() || 'a unique product approach'
  }. As the platform grows, network effects and accumulated data create increasingly strong barriers to entry for competitors.`;

  return {
    global: globalCompetitors,
    regional: regionalCompetitors,
    local: localCompetitors,
    your_value: {
      differentiators,
      why_customers_choose_you: whyCustomers,
      defensible_moat: defensibleMoat,
    },
  };
}

// ---------------------------------------------------------------------------
// Positioning statement
// ---------------------------------------------------------------------------

function generatePositioning(inputs: IdeaValidationInputs): string {
  const companyName = extractCompanyName(inputs.business_idea);
  const industry = detectIndustry(inputs.business_idea, inputs.problem_statement);

  const category = industry.label.toLowerCase();
  const target = inputs.target_customer || 'underserved customers';
  const problem = inputs.problem_statement
    ? inputs.problem_statement.slice(0, 80) + (inputs.problem_statement.length > 80 ? '...' : '')
    : 'key pain points in their workflow';
  const approach = inputs.solution_differentiation
    ? inputs.solution_differentiation.slice(0, 80) + (inputs.solution_differentiation.length > 80 ? '...' : '')
    : 'an innovative, customer-first solution';
  const competitors = industry.keyPlayers.slice(0, 2).join(' and ');
  const limitation = 'focus on broad market segments without addressing niche customer needs';

  return `${companyName} is the ${category} solution that helps ${target} to ${problem} by ${approach}, unlike ${competitors} who ${limitation}.`;
}

// ---------------------------------------------------------------------------
// Pitch deck
// ---------------------------------------------------------------------------

function generatePitchDeck(inputs: IdeaValidationInputs, market: MarketAnalysis, competitors: CompetitorAnalysis): PitchDeckOutput {
  const industry = detectIndustry(inputs.business_idea, inputs.problem_statement);

  // Problem slide
  const problemBullets: string[] = [];
  const probSentences = inputs.problem_statement.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  for (const s of probSentences.slice(0, 3)) {
    problemBullets.push(s.trim());
  }
  if (problemBullets.length < 3) {
    problemBullets.push(`Current solutions in ${industry.label} fail to adequately address customer needs`);
    problemBullets.push('Significant time and cost wasted on inefficient existing alternatives');
  }
  const problemSlide: SlideContent = {
    title: 'The Problem',
    bullets: problemBullets.slice(0, 4),
    source: 'Customer Research & Market Analysis',
  };

  // Solution slide
  const solutionBullets: string[] = [];
  const solSentences = inputs.solution_differentiation.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  for (const s of solSentences.slice(0, 3)) {
    solutionBullets.push(s.trim());
  }
  if (solutionBullets.length < 3) {
    solutionBullets.push(`Purpose-built solution for ${inputs.target_customer || 'the target market'}`);
    solutionBullets.push('10x better user experience compared to existing alternatives');
  }
  const solutionSlide: SlideContent = {
    title: 'Our Solution',
    bullets: solutionBullets.slice(0, 4),
    source: 'Product Strategy',
  };

  // Market slide
  const marketSlide: SlideContent = {
    title: 'Market Opportunity',
    bullets: [
      `Global ${industry.label} market: ${market.global.size} growing at ${market.global.growth_rate}`,
      `TAM: ${market.tam.value_inr} (${market.tam.value_usd})`,
      `SAM: ${market.sam.value_inr} (${market.sam.value_usd})`,
      `SOM (Year 1-3): ${market.som.value_inr} (${market.som.value_usd})`,
    ],
    source: market.tam.source,
  };

  // Competition slide
  const competitionSlide: SlideContent = {
    title: 'Competitive Landscape',
    bullets: [
      ...competitors.your_value.differentiators.slice(0, 2).map((d) => `✓ ${d}`),
      `Key gap in market: ${competitors.global[0]?.gap || 'Existing solutions lack customer focus'}`,
      `Our moat: ${competitors.your_value.defensible_moat.slice(0, 120)}...`,
    ],
    source: 'Competitive Analysis',
  };

  // Why Now slide
  const whyNowSlide: SlideContent = {
    title: 'Why Now?',
    bullets: industry.trends,
    source: 'Industry Trend Analysis 2024',
  };

  // Target Customer slide
  const customerBullets: string[] = [];
  const custSentences = inputs.target_customer.split(/[.!?;,]+/).filter((s) => s.trim().length > 5);
  for (const s of custSentences.slice(0, 3)) {
    customerBullets.push(s.trim());
  }
  if (customerBullets.length < 3) {
    customerBullets.push(`Primary market: ${inputs.target_location || 'Target geography'}`);
    customerBullets.push(`Estimated initial addressable customers: ${market.customer_count}`);
  }
  const targetCustomerSlide: SlideContent = {
    title: 'Target Customer',
    bullets: customerBullets.slice(0, 4),
    source: 'Customer Research',
  };

  return {
    problem_slide: problemSlide,
    solution_slide: solutionSlide,
    market_slide: marketSlide,
    competition_slide: competitionSlide,
    why_now_slide: whyNowSlide,
    target_customer_slide: targetCustomerSlide,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generateReports(inputs: IdeaValidationInputs, refinements: Refinements): AllOutputs {
  // Merge refinements into inputs for richer analysis
  const enrichedInputs: IdeaValidationInputs = {
    ...inputs,
    target_customer: refinements.target_narrowed
      ? `${inputs.target_customer}. Additional detail: ${refinements.target_narrowed}`
      : inputs.target_customer,
    solution_differentiation: refinements.differentiation_clarified
      ? `${inputs.solution_differentiation}. ${refinements.differentiation_clarified}`
      : inputs.solution_differentiation,
    problem_statement: refinements.additional_context
      ? `${inputs.problem_statement}. ${refinements.additional_context}`
      : inputs.problem_statement,
  };

  const validation = generateValidation(enrichedInputs);
  const market = generateMarketAnalysis(enrichedInputs);
  const competitors = generateCompetitorAnalysis(enrichedInputs);
  const positioning = generatePositioning(enrichedInputs);
  const pitchDeck = generatePitchDeck(enrichedInputs, market, competitors);

  return {
    validation,
    market,
    competitors,
    positioning,
    pitch_deck: pitchDeck,
  };
}
