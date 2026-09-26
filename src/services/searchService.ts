import { SchemeRecord, UserProfile, CandidateScheme, SearchFilters } from '../types/scheme';
import { SchemeDataAdapter } from './schemeDataAdapter';
import { EligibilityEngine } from './eligibilityEngine';

/**
 * Universal Scheme Retrieval & Ranking Engine
 * Searches the database first, retrieves broad candidate pool,
 * applies non-exclusionary matching, and executes criterion-by-criterion analysis.
 */
export class SearchService {
  /**
   * Search and evaluate schemes for a user profile
   */
  public static searchSchemes(
    profile: UserProfile,
    filters?: SearchFilters,
    customDatabase?: SchemeRecord[]
  ): CandidateScheme[] {
    const allSchemes = customDatabase || SchemeDataAdapter.getSchemes();
    if (!allSchemes || allSchemes.length === 0) {
      return [];
    }

    const statedNeed = (profile.stated_need || '').toLowerCase();
    const inferredCategories = profile.inferred_categories.map((c) => c.toLowerCase());
    const queryTokens = statedNeed
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !['and', 'for', 'the', 'with', 'from', 'want', 'need', 'help', 'looking'].includes(t));

    const candidates: CandidateScheme[] = [];

    for (const scheme of allSchemes) {
      // 1. Check User Filter Overrides
      if (filters?.category && filters.category !== 'ALL') {
        const catMatch = scheme.categories.some((c) => c.toLowerCase() === filters.category?.toLowerCase());
        if (!catMatch) continue;
      }

      if (filters?.state && filters.state !== 'ALL') {
        const stateMatch = scheme.states.includes('All-India') || scheme.states.some((s) => s.toLowerCase() === filters.state?.toLowerCase());
        if (!stateMatch) continue;
      }

      if (filters?.provider_type && filters.provider_type !== 'ALL') {
        if (scheme.provider_type.toLowerCase() !== filters.provider_type.toLowerCase()) continue;
      }

      // 2. Keyword & Category Semantic Match Analysis
      const schemeText = [
        scheme.name,
        scheme.description,
        ...scheme.categories,
        ...scheme.beneficiary_groups,
        ...scheme.benefits.map((b) => b.type + ' ' + b.description + ' ' + b.amount_or_details),
      ].join(' ').toLowerCase();

      // Check category overlap
      const hasCategoryMatch = scheme.categories.some((cat) =>
        inferredCategories.some((inferred) => inferred.includes(cat.toLowerCase()) || cat.toLowerCase().includes(inferred))
      );

      // Check token match count
      let matchedTokensCount = 0;
      const matchedTokens: string[] = [];
      for (const token of queryTokens) {
        if (schemeText.includes(token)) {
          matchedTokensCount++;
          matchedTokens.push(token);
        }
      }

      // If user provided a specific search filter or stated need
      const isGenerallyRelevant =
        hasCategoryMatch ||
        matchedTokensCount > 0 ||
        queryTokens.length === 0 || // empty need returns top schemes
        (statedNeed.length < 5 && scheme.categories.length > 0);

      // Execute deep criterion-by-criterion eligibility evaluation
      const evalResult = EligibilityEngine.evaluateScheme(scheme, profile);

      // Filter by match state if requested
      if (filters?.match_state && filters.match_state !== 'ALL') {
        if (evalResult.matchState !== filters.match_state) continue;
      }

      // Filter by custom text query within results
      if (filters?.search_query && filters.search_query.trim().length > 0) {
        const sq = filters.search_query.toLowerCase();
        if (!schemeText.includes(sq)) continue;
      }

      // Compute composite ranking score
      let rankScore = evalResult.score;
      if (hasCategoryMatch) rankScore += 30;
      rankScore += matchedTokensCount * 8;
      if (evalResult.conflictingInformation.length > 0) {
        rankScore -= 40;
      }

      // Build CandidateScheme with full trace
      candidates.push({
        scheme,
        match_state: evalResult.matchState,
        score: rankScore,
        why_relevant: evalResult.whyRelevant,
        criteria: evalResult.criteria,
        missing_information: evalResult.missingInformation,
        conflicting_information: evalResult.conflictingInformation,
        benefits: scheme.benefits,
        documents: scheme.documents,
        application: {
          steps: scheme.application_steps,
          url: scheme.application_url,
        },
        source: {
          name: scheme.source_name,
          url: scheme.source_url,
        },
        freshness: scheme.last_updated,
        verification_note:
          'Evaluated against official government portal criteria. Verification by competent authority is required upon submission.',
        retrieval_trace: {
          retrieval_reason: hasCategoryMatch
            ? `Category match: ${scheme.categories.join(', ')}`
            : matchedTokensCount > 0
            ? `Keyword relevance: "${matchedTokens.slice(0, 3).join(', ')}"`
            : 'Broad domain eligibility',
          matched_fields: matchedTokens,
          uncertain_fields: evalResult.missingInformation,
        },
      });
    }

    // Rank candidates by composite score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    return candidates;
  }

  /**
   * Generates dynamic adaptive questions based on candidate schemes and current profile
   */
  public static getAdaptiveQuestions(profile: UserProfile, candidates: CandidateScheme[]) {
    // Count frequency of missing fields across top candidate schemes
    const missingFrequency: Record<string, number> = {};

    candidates.slice(0, 8).forEach((candidate) => {
      candidate.criteria.forEach((crit) => {
        if (crit.status === 'UNKNOWN') {
          missingFrequency[crit.criterion_name] = (missingFrequency[crit.criterion_name] || 0) + 1;
        }
      });
    });

    const knownFields = new Set(profile.facts.map((f) => f.field));
    const questions = [];

    // State question if missing
    if (!knownFields.has('state')) {
      questions.push({
        id: 'q_state',
        field: 'state',
        questionText: 'Which state or union territory do you reside in?',
        helpText: 'Certain benefits are state-sponsored or have domicile requirements.',
        inputType: 'select' as const,
        priority: 10,
        options: [
          { label: 'All-India / Central', value: 'All-India' },
          { label: 'Karnataka', value: 'Karnataka' },
          { label: 'Maharashtra', value: 'Maharashtra' },
          { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
          { label: 'Bihar', value: 'Bihar' },
          { label: 'Tamil Nadu', value: 'Tamil Nadu' },
          { label: 'Rajasthan', value: 'Rajasthan' },
          { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
          { label: 'West Bengal', value: 'West Bengal' },
          { label: 'Gujarat', value: 'Gujarat' },
          { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
          { label: 'Telangana', value: 'Telangana' },
          { label: 'Kerala', value: 'Kerala' },
          { label: 'Delhi', value: 'Delhi' },
          { label: 'Other State', value: 'Other' },
        ],
      });
    }

    // Income question if missing and relevant
    if (!knownFields.has('annual_household_income')) {
      questions.push({
        id: 'q_income',
        field: 'annual_household_income',
        questionText: 'What is your approximate annual household income?',
        helpText: 'Helps determine whether you qualify for targeted low-income or middle-income subsidies.',
        inputType: 'select' as const,
        priority: 9,
        options: [
          { label: 'Less than ₹1.8 Lakh / year (BPL / Very Low)', value: 150000 },
          { label: '₹1.8 Lakh – ₹2.5 Lakh / year (Low)', value: 220000 },
          { label: '₹2.5 Lakh – ₹4.5 Lakh / year (EWS/Lower Middle)', value: 350000 },
          { label: '₹4.5 Lakh – ₹8 Lakh / year (Middle)', value: 600000 },
          { label: 'Above ₹8 Lakh / year', value: 950000 },
        ],
      });
    }

    // Age question if missing
    if (!knownFields.has('age')) {
      questions.push({
        id: 'q_age',
        field: 'age',
        questionText: 'What is your current age?',
        helpText: 'Several schemes have strict age brackets (e.g. youth, senior citizen, scholarships).',
        inputType: 'number' as const,
        priority: 8,
      });
    }

    // Occupation question if missing
    if (!knownFields.has('occupation') && !knownFields.has('education_status')) {
      questions.push({
        id: 'q_occupation',
        field: 'occupation',
        questionText: 'What is your current primary occupation or work status?',
        helpText: 'Different schemes assist students, farmers, artisans, small businesses, or unorganized workers.',
        inputType: 'select' as const,
        priority: 7,
        options: [
          { label: 'Student / Enrolled in Higher Education', value: 'Student' },
          { label: 'Farmer / Agricultural Cultivator', value: 'Farmer' },
          { label: 'Traditional Artisan / Craftsperson (Carpenter, Mason, etc.)', value: 'Artisan' },
          { label: 'Small Business Owner / Trader / Vendor', value: 'Small Business' },
          { label: 'Unorganized Daily Wage Worker / Labourer', value: 'Unorganized Worker' },
          { label: 'Unemployed Seeking Employment / Training', value: 'Unemployed' },
          { label: 'Salaried Private / Govt Employee', value: 'Salaried Employee' },
          { label: 'Homemaker / Not working', value: 'Homemaker' },
        ],
      });
    }

    // Social category (optional voluntary disclosure)
    if (!knownFields.has('social_category') && missingFrequency['Social Category Requirement']) {
      questions.push({
        id: 'q_social_cat',
        field: 'social_category',
        questionText: 'Which social category do you belong to? (Optional)',
        helpText: 'Some schemes offer dedicated quotas or higher funding for reserved communities.',
        inputType: 'select' as const,
        priority: 5,
        options: [
          { label: 'General', value: 'General' },
          { label: 'OBC (Other Backward Classes)', value: 'OBC' },
          { label: 'SC (Scheduled Caste)', value: 'SC' },
          { label: 'ST (Scheduled Tribe)', value: 'ST' },
          { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
        ],
      });
    }

    return questions.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }
}
