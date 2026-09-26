/**
 * SchemeSaar — Universal Scheme Discovery & Eligibility Guidance Platform
 * Canonical Data Types adhering to the System Blueprint Specification
 */

export type ProviderType = "central" | "state" | "joint" | "private" | "unknown";
export type GovernmentLevel = "Central" | "State" | "District" | "Municipal" | "Unknown";
export type SchemeStatus = "Active" | "Closed" | "Upcoming" | "Unknown";

export interface AgeRules {
  min_age?: number | null | undefined;
  max_age?: number | null | undefined;
  description?: string | undefined;
}

export interface IncomeRules {
  max_annual_income?: number | null | undefined;
  min_annual_income?: number | null | undefined;
  category_specific_limits?: Record<string, number> | undefined;
  description?: string | undefined;
}

export interface OccupationRules {
  allowed_occupations?: string[];
  disallowed_occupations?: string[];
  farmer_types?: string[]; // e.g. Small & Marginal, Tenant, Any
  description?: string | undefined;
}

export interface EducationRules {
  min_education_level?: string;
  eligible_courses?: string[];
  current_student_required?: boolean;
  description?: string | undefined;
}

export interface GenderRules {
  allowed_genders?: ("male" | "female" | "transgender" | "any")[];
  description?: string | undefined;
}

export interface CategoryRules {
  allowed_social_categories?: ("General" | "OBC" | "SC" | "ST" | "EWS" | "Minority" | "Any")[];
  minority_only?: boolean;
  description?: string | undefined;
}

export interface GeographyRules {
  area_type?: ("Rural" | "Urban" | "Semi-Urban" | "Any")[];
  states?: string[];
  districts?: string[];
  description?: string | undefined;
}

export interface BenefitItem {
  type: string;
  amount_or_details: string;
  frequency?: string;
  description: string;
}

export interface DocumentItem {
  name: string;
  mandatory: boolean;
  description?: string | undefined;
  alternative_documents?: string[];
}

export interface SchemeRecord {
  id: string;
  name: string;
  description: string;
  provider: string;
  provider_type: ProviderType;
  government_level: GovernmentLevel;
  categories: string[];
  states: string[]; // ['All-India'] or specific state names
  districts: string[];
  beneficiary_groups: string[];
  age_rules: AgeRules | null;
  income_rules: IncomeRules | null;
  occupation_rules: OccupationRules | null;
  education_rules: EducationRules | null;
  gender_rules: GenderRules | null;
  category_rules: CategoryRules | null;
  geography_rules: GeographyRules | null;
  other_rules: Record<string, any>;
  benefits: BenefitItem[];
  documents: DocumentItem[];
  application_steps: string[];
  application_url: string | null;
  source_url: string | null;
  source_name: string;
  last_updated: string | null;
  status: SchemeStatus;
  raw_record: Record<string, any>;
}

// User Profile Extraction Model
export interface ProfileFact {
  field: string;
  value: any;
  confidence: number;
  source: string;
}

export interface UserProfile {
  stated_need: string;
  facts: ProfileFact[];
  inferred_categories: string[];
  missing_high_value_fields: string[];
  privacy_flags?: {
    has_voluntarily_provided_sensitive_info?: boolean;
  };
}

// Criterion Evaluation States
export type CriterionStatus =
  "SATISFIED" | "NOT_SATISFIED" | "UNKNOWN" | "NOT_APPLICABLE" | "CONFLICTING_DATA";

export interface CriterionEvaluation {
  criterion_name: string;
  user_value: any;
  required_value: any;
  status: CriterionStatus;
  evidence: string;
  source_scheme_field: string;
  explanation: string;
}

// Guidance Match States
export type OverallMatchState =
  "LIKELY MATCH" | "POTENTIAL MATCH" | "MORE INFORMATION NEEDED" | "DOES NOT APPEAR TO MATCH";

export interface CandidateScheme {
  scheme: SchemeRecord;
  match_state: OverallMatchState;
  score: number; // Internal ranking score; NOT shown as official probability
  why_relevant: string;
  criteria: CriterionEvaluation[];
  missing_information: string[];
  conflicting_information: string[];
  benefits: BenefitItem[];
  documents: DocumentItem[];
  application: {
    steps: string[];
    url: string | null;
  };
  source: {
    name: string;
    url: string | null;
  };
  freshness: string | null;
  verification_note: string;
  retrieval_trace: {
    retrieval_reason: string;
    matched_fields: string[];
    uncertain_fields: string[];
  };
}

export interface AdaptiveQuestion {
  id: string;
  field: string;
  questionText: string;
  helpText?: string;
  categoryContext?: string;
  inputType: "number" | "select" | "text" | "boolean";
  options?: { label: string; value: any }[];
  priority: number;
}

export interface SearchFilters {
  category?: string;
  state?: string;
  provider_type?: string;
  match_state?: OverallMatchState | "ALL";
  benefit_type?: string;
  search_query?: string;
}
