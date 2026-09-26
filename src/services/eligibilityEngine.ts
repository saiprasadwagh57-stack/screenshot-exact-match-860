import {
  SchemeRecord,
  UserProfile,
  CriterionEvaluation,
  CriterionStatus,
  OverallMatchState,
  CandidateScheme,
} from "../types/scheme";

/**
 * SchemeSaar Eligibility Reasoning Engine
 * Evaluates criteria independently: SATISFIED, NOT_SATISFIED, UNKNOWN, NOT_APPLICABLE, CONFLICTING_DATA.
 * Enforces rule: Never convert UNKNOWN into SATISFIED.
 * Computes guidance state: LIKELY MATCH, POTENTIAL MATCH, MORE INFORMATION NEEDED, DOES NOT APPEAR TO MATCH.
 */
export class EligibilityEngine {
  /**
   * Evaluates all eligibility criteria for a given scheme against user profile facts
   */
  public static evaluateScheme(
    scheme: SchemeRecord,
    profile: UserProfile,
  ): {
    criteria: CriterionEvaluation[];
    matchState: OverallMatchState;
    whyRelevant: string;
    missingInformation: string[];
    conflictingInformation: string[];
    score: number;
  } {
    const criteria: CriterionEvaluation[] = [];
    const missingInformation: string[] = [];
    const conflictingInformation: string[] = [];

    // Helper to get fact
    const getFact = (field: string) => profile.facts.find((f) => f.field === field);

    // 1. Age Evaluation
    if (
      scheme.age_rules &&
      (scheme.age_rules.min_age !== null || scheme.age_rules.max_age !== null)
    ) {
      const ageFact = getFact("age");
      const minAge = scheme.age_rules.min_age;
      const maxAge = scheme.age_rules.max_age;
      const reqStr = [
        minAge ? `Min Age: ${minAge} yrs` : "",
        maxAge ? `Max Age: ${maxAge} yrs` : "",
      ]
        .filter(Boolean)
        .join(", ");

      if (!ageFact || ageFact.value === undefined || ageFact.value === null) {
        criteria.push({
          criterion_name: "Age Requirement",
          user_value: "Unknown / Not provided",
          required_value: reqStr,
          status: "UNKNOWN",
          evidence: "User has not specified their age.",
          source_scheme_field: "scheme.age_rules",
          explanation: `Scheme specifies ${reqStr}. You have not provided your age yet.`,
        });
        missingInformation.push(`Age (required: ${reqStr})`);
      } else {
        const userAge = Number(ageFact.value);
        let satisfied = true;
        if (minAge !== null && minAge !== undefined && userAge < minAge) satisfied = false;
        if (maxAge !== null && maxAge !== undefined && userAge > maxAge) satisfied = false;

        if (satisfied) {
          criteria.push({
            criterion_name: "Age Requirement",
            user_value: `${userAge} years`,
            required_value: reqStr,
            status: "SATISFIED",
            evidence: `User is ${userAge} years old (source: "${ageFact.source}")`,
            source_scheme_field: "scheme.age_rules",
            explanation: `Your age (${userAge}) falls within the required age bracket (${reqStr}).`,
          });
        } else {
          criteria.push({
            criterion_name: "Age Requirement",
            user_value: `${userAge} years`,
            required_value: reqStr,
            status: "NOT_SATISFIED",
            evidence: `User stated age ${userAge}, but criteria requires ${reqStr}.`,
            source_scheme_field: "scheme.age_rules",
            explanation: `Your stated age (${userAge}) does not meet the documented criteria of ${reqStr}.`,
          });
          conflictingInformation.push(`Age: stated ${userAge}, requires ${reqStr}`);
        }
      }
    }

    // 2. Annual Household Income Evaluation
    if (
      scheme.income_rules &&
      (scheme.income_rules.max_annual_income !== null || scheme.income_rules.description)
    ) {
      const incomeFact = getFact("annual_household_income");
      const maxIncome = scheme.income_rules.max_annual_income;
      const reqStr = maxIncome
        ? `Max Annual Income: ₹${maxIncome.toLocaleString("en-IN")}`
        : scheme.income_rules.description || "Income limits documented";

      if (!incomeFact || incomeFact.value === undefined || incomeFact.value === null) {
        criteria.push({
          criterion_name: "Household Income Ceiling",
          user_value: "Unknown / Not provided",
          required_value: reqStr,
          status: "UNKNOWN",
          evidence: "Household income has not been provided by user.",
          source_scheme_field: "scheme.income_rules",
          explanation: `Scheme specifies ${reqStr}. Provide your family income to verify compliance.`,
        });
        missingInformation.push(`Annual Household Income (limit: ${reqStr})`);
      } else {
        const userIncome = Number(incomeFact.value);
        if (maxIncome && userIncome > maxIncome) {
          criteria.push({
            criterion_name: "Household Income Ceiling",
            user_value: `₹${userIncome.toLocaleString("en-IN")}`,
            required_value: reqStr,
            status: "NOT_SATISFIED",
            evidence: `Stated annual income ₹${userIncome.toLocaleString("en-IN")} exceeds ceiling ₹${maxIncome.toLocaleString("en-IN")}.`,
            source_scheme_field: "scheme.income_rules.max_annual_income",
            explanation: `Your household income (₹${userIncome.toLocaleString("en-IN")}) exceeds the scheme maximum ceiling of ₹${maxIncome.toLocaleString("en-IN")}.`,
          });
          conflictingInformation.push(
            `Income: ₹${userIncome.toLocaleString("en-IN")} exceeds limit ₹${maxIncome.toLocaleString("en-IN")}`,
          );
        } else {
          criteria.push({
            criterion_name: "Household Income Ceiling",
            user_value: `₹${userIncome.toLocaleString("en-IN")}`,
            required_value: reqStr,
            status: "SATISFIED",
            evidence: `Stated annual income ₹${userIncome.toLocaleString("en-IN")} is within ceiling ${reqStr}.`,
            source_scheme_field: "scheme.income_rules",
            explanation: `Your income is within the qualifying limit (${reqStr}).`,
          });
        }
      }
    }

    // 3. State / Regional Geography Evaluation
    const stateFact = getFact("state");
    const isAllIndia = scheme.states.includes("All-India") || scheme.states.length === 0;

    if (isAllIndia) {
      criteria.push({
        criterion_name: "State / Region Eligibility",
        user_value: stateFact ? String(stateFact.value) : "Any State",
        required_value: "Pan-India (All States & UTs)",
        status: "SATISFIED",
        evidence: "Scheme is available across all Indian States & Union Territories.",
        source_scheme_field: "scheme.states",
        explanation:
          "This is a nationwide central initiative available to residents across all states.",
      });
    } else {
      if (!stateFact || !stateFact.value) {
        criteria.push({
          criterion_name: "State / Domicile Requirement",
          user_value: "Unknown / Not provided",
          required_value: scheme.states.join(", "),
          status: "UNKNOWN",
          evidence: "State of residence was not provided by user.",
          source_scheme_field: "scheme.states",
          explanation: `This scheme is exclusively for residents of: ${scheme.states.join(", ")}.`,
        });
        missingInformation.push(`State of Residence (required: ${scheme.states.join(", ")})`);
      } else {
        const userState = String(stateFact.value).trim().toLowerCase();
        const stateMatches = scheme.states.some(
          (s) => s.toLowerCase() === userState || userState.includes(s.toLowerCase()),
        );

        if (stateMatches) {
          criteria.push({
            criterion_name: "State / Domicile Requirement",
            user_value: String(stateFact.value),
            required_value: scheme.states.join(", "),
            status: "SATISFIED",
            evidence: `User resides in ${stateFact.value}, which is in eligible states list.`,
            source_scheme_field: "scheme.states",
            explanation: `Your state (${stateFact.value}) matches the scheme geographic coverage.`,
          });
        } else {
          criteria.push({
            criterion_name: "State / Domicile Requirement",
            user_value: String(stateFact.value),
            required_value: scheme.states.join(", "),
            status: "NOT_SATISFIED",
            evidence: `User resides in ${stateFact.value}, but scheme is restricted to: ${scheme.states.join(", ")}.`,
            source_scheme_field: "scheme.states",
            explanation: `Scheme is restricted to residents of ${scheme.states.join(", ")}.`,
          });
          conflictingInformation.push(
            `State: residing in ${stateFact.value}, scheme restricted to ${scheme.states.join(", ")}`,
          );
        }
      }
    }

    // 4. Occupation & Student Status Evaluation
    const occFact = getFact("occupation");
    const eduStatusFact = getFact("education_status");

    if (scheme.occupation_rules && scheme.occupation_rules.allowed_occupations) {
      const allowed = scheme.occupation_rules.allowed_occupations;
      if (!occFact && !eduStatusFact) {
        criteria.push({
          criterion_name: "Occupation / Work Status",
          user_value: "Unknown",
          required_value: allowed.join(", "),
          status: "UNKNOWN",
          evidence: "Occupation or employment status has not been specified.",
          source_scheme_field: "scheme.occupation_rules.allowed_occupations",
          explanation: `Applicable to: ${allowed.join(", ")}.`,
        });
        missingInformation.push(`Occupation / Employment Status (target: ${allowed.join(", ")})`);
      } else {
        const userOcc =
          (occFact ? String(occFact.value) : "") +
          " " +
          (eduStatusFact ? String(eduStatusFact.value) : "");
        const matchesOcc = allowed.some(
          (a) =>
            a.toLowerCase() === "any" ||
            userOcc.toLowerCase().includes(a.toLowerCase()) ||
            a.toLowerCase().includes(userOcc.toLowerCase()),
        );

        if (matchesOcc) {
          criteria.push({
            criterion_name: "Occupation / Work Status",
            user_value: occFact ? String(occFact.value) : String(eduStatusFact?.value),
            required_value: allowed.join(", "),
            status: "SATISFIED",
            evidence: `User profile indicates matching occupation/status: ${userOcc}.`,
            source_scheme_field: "scheme.occupation_rules.allowed_occupations",
            explanation: `Your occupation matches the target category for this scheme.`,
          });
        } else {
          criteria.push({
            criterion_name: "Occupation / Work Status",
            user_value: occFact ? String(occFact.value) : String(eduStatusFact?.value),
            required_value: allowed.join(", "),
            status: "NOT_SATISFIED",
            evidence: `Stated activity "${userOcc}" does not match scheme target: ${allowed.join(", ")}.`,
            source_scheme_field: "scheme.occupation_rules.allowed_occupations",
            explanation: `This scheme is designated for ${allowed.join(", ")}.`,
          });
          conflictingInformation.push(`Occupation mismatch: requires ${allowed.join(", ")}`);
        }
      }
    }

    // 5. Gender Evaluation (if restricted)
    if (
      scheme.gender_rules &&
      scheme.gender_rules.allowed_genders &&
      !scheme.gender_rules.allowed_genders.includes("any")
    ) {
      const genderFact = getFact("gender");
      const allowedGenders = scheme.gender_rules.allowed_genders;

      if (!genderFact || !genderFact.value) {
        criteria.push({
          criterion_name: "Gender Eligibility",
          user_value: "Unknown / Not provided",
          required_value: allowedGenders.join(", "),
          status: "UNKNOWN",
          evidence: "Gender was not indicated in user statement.",
          source_scheme_field: "scheme.gender_rules.allowed_genders",
          explanation: `This scheme is exclusively for: ${allowedGenders.join(", ")}.`,
        });
        missingInformation.push(`Gender (scheme is for ${allowedGenders.join(", ")})`);
      } else {
        const userGender = String(genderFact.value).trim().toLowerCase();
        const matchesGender = allowedGenders.some((g) => g.toLowerCase() === userGender);

        if (matchesGender) {
          criteria.push({
            criterion_name: "Gender Eligibility",
            user_value: String(genderFact.value),
            required_value: allowedGenders.join(", "),
            status: "SATISFIED",
            evidence: `User stated gender matches requirement (${allowedGenders.join(", ")}).`,
            source_scheme_field: "scheme.gender_rules",
            explanation: `Gender criterion satisfied.`,
          });
        } else {
          criteria.push({
            criterion_name: "Gender Eligibility",
            user_value: String(genderFact.value),
            required_value: allowedGenders.join(", "),
            status: "NOT_SATISFIED",
            evidence: `Stated gender "${genderFact.value}" is not within eligible genders: ${allowedGenders.join(", ")}.`,
            source_scheme_field: "scheme.gender_rules",
            explanation: `Scheme is exclusively for ${allowedGenders.join(", ")}.`,
          });
          conflictingInformation.push(
            `Gender mismatch: scheme is for ${allowedGenders.join(", ")}`,
          );
        }
      }
    }

    // 6. Social Category Evaluation (if restricted to specific category e.g. SC/ST/OBC/Minority)
    if (
      scheme.category_rules &&
      scheme.category_rules.allowed_social_categories &&
      !scheme.category_rules.allowed_social_categories.includes("Any")
    ) {
      const catFact = getFact("social_category");
      const allowedCats = scheme.category_rules.allowed_social_categories;

      if (!catFact || !catFact.value) {
        criteria.push({
          criterion_name: "Social Category Requirement",
          user_value: "Unknown / Not provided",
          required_value: allowedCats.join(", "),
          status: "UNKNOWN",
          evidence: "User has not voluntarily provided social category.",
          source_scheme_field: "scheme.category_rules",
          explanation: `Scheme is specifically designated for: ${allowedCats.join(", ")}.`,
        });
        missingInformation.push(`Social Category (${allowedCats.join(", ")})`);
      } else {
        const userCat = String(catFact.value).trim().toUpperCase();
        const matchesCat = allowedCats.some((c) => c.toUpperCase() === userCat);

        if (matchesCat) {
          criteria.push({
            criterion_name: "Social Category Requirement",
            user_value: String(catFact.value),
            required_value: allowedCats.join(", "),
            status: "SATISFIED",
            evidence: `User belongs to eligible category (${catFact.value}).`,
            source_scheme_field: "scheme.category_rules",
            explanation: `Category criterion satisfied with valid certificate requirement.`,
          });
        } else {
          criteria.push({
            criterion_name: "Social Category Requirement",
            user_value: String(catFact.value),
            required_value: allowedCats.join(", "),
            status: "NOT_SATISFIED",
            evidence: `Stated category "${catFact.value}" is outside eligible categories: ${allowedCats.join(", ")}.`,
            source_scheme_field: "scheme.category_rules",
            explanation: `This scheme is exclusively for ${allowedCats.join(", ")}.`,
          });
          conflictingInformation.push(`Category mismatch: requires ${allowedCats.join(", ")}`);
        }
      }
    }

    // Compute Overall Match State strictly following Prompt 4:
    // 1. LIKELY MATCH: available information satisfies documented relevant criteria and NO conflicts.
    // 2. POTENTIAL MATCH: several criteria match but important information remains unknown.
    // 3. MORE INFORMATION NEEDED: scheme appears relevant to stated need, but decisive facts are missing.
    // 4. DOES NOT APPEAR TO MATCH: explicit criteria conflict with user information.

    const satisfiedCount = criteria.filter((c) => c.status === "SATISFIED").length;
    const unknownCount = criteria.filter((c) => c.status === "UNKNOWN").length;
    const notSatisfiedCount = criteria.filter((c) => c.status === "NOT_SATISFIED").length;

    let matchState: OverallMatchState = "POTENTIAL MATCH";
    let score = 50;

    if (notSatisfiedCount > 0) {
      matchState = "DOES NOT APPEAR TO MATCH";
      score = 15;
    } else if (unknownCount === 0 && satisfiedCount > 0) {
      matchState = "LIKELY MATCH";
      score = 95;
    } else if (unknownCount >= 2 && satisfiedCount <= 1) {
      matchState = "MORE INFORMATION NEEDED";
      score = 45;
    } else if (satisfiedCount >= 2) {
      matchState = "LIKELY MATCH";
      score = 85 - unknownCount * 10;
    } else {
      matchState = "POTENTIAL MATCH";
      score = 60;
    }

    // Generate concise "Why it appeared" explanation
    const categoryOverlap = scheme.categories.filter((c) =>
      profile.inferred_categories.includes(c),
    );
    let whyRelevant = "";
    if (categoryOverlap.length > 0) {
      whyRelevant = `Matches your stated need in ${categoryOverlap.join(" & ")}.`;
    } else {
      whyRelevant = `Provides assistance aligned with your query goals (${scheme.categories.join(", ")}).`;
    }
    if (satisfiedCount > 0) {
      whyRelevant += ` Satisfies ${satisfiedCount} documented eligibility condition${satisfiedCount > 1 ? "s" : ""}.`;
    }
    if (unknownCount > 0) {
      whyRelevant += ` ${unknownCount} criteria still need verification.`;
    }

    return {
      criteria,
      matchState,
      whyRelevant,
      missingInformation,
      conflictingInformation,
      score,
    };
  }
}
