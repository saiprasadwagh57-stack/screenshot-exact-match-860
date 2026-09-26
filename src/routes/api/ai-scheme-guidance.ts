import { createFileRoute } from "@tanstack/react-router";
import { ai } from "../../lib/gemini";
import { SchemeRecord, UserProfile } from "../../types/scheme";

export interface AiSchemeGuidanceResponse {
  schemeId: string;
  schemeName: string;
  eligibilityStatus:
    | "Likely Eligible"
    | "Conditionally Eligible"
    | "Likely Ineligible"
    | "Open to All Eligible Citizens";
  eligibilityReasoning: string;
  consciousSummary: string;
  financialAndMaterialBenefits: string[];
  essentialDocumentsChecklist: Array<{
    document: string;
    importance: "Mandatory" | "Recommended" | "Alternative Available";
    notes: string;
  }>;
  stepByStepApplication: string[];
  crucialWarningsAndTips: string[];
  officialPortalUrl?: string;
}

export const Route = createFileRoute("/api/ai-scheme-guidance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const scheme: SchemeRecord = body.scheme;
          const userProfile: UserProfile | undefined = body.userProfile;
          const userQuery: string | undefined = body.userQuery;

          if (!scheme || !scheme.name) {
            return Response.json({ error: "Scheme data is required" }, { status: 400 });
          }

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            // High-quality heuristic fallback if API key is not yet configured
            const fallback: AiSchemeGuidanceResponse = {
              schemeId: scheme.id,
              schemeName: scheme.name,
              eligibilityStatus: "Conditionally Eligible",
              eligibilityReasoning: `Eligibility is determined by age, income, and state residency rules set by ${scheme.provider}. Verify criteria before application.`,
              consciousSummary: scheme.description || scheme.name,
              financialAndMaterialBenefits: scheme.benefits.map((b) => b.amount_or_details),
              essentialDocumentsChecklist: scheme.documents.map((d) => ({
                document: d.name,
                importance: d.is_mandatory ? "Mandatory" : "Recommended",
                notes:
                  d.alternative_acceptable.length > 0
                    ? `Alternatives: ${d.alternative_acceptable.join(", ")}`
                    : "Standard certified copy required",
              })),
              stepByStepApplication: [
                "Verify required identity & residency documentation.",
                `Submit application via ${scheme.application_process.mode || "Official Portal / Local Government Office"}.`,
                scheme.source_url
                  ? `Visit official scheme portal: ${scheme.source_url}`
                  : "Track application with the nodal office.",
              ],
              crucialWarningsAndTips: [
                "Ensure bank account is Aadhaar-seeded for direct DBT transfers.",
                "Keep physical receipt or digital application acknowledgement number safe.",
              ],
              officialPortalUrl: scheme.source_url,
            };
            return Response.json({ guidance: fallback, source: "heuristic" });
          }

          const prompt = `
You are SchemeSaar's expert government welfare intelligence. Analyze this Indian government scheme and extract the conscious, needed, and plain-language information for the citizen.

Scheme Details:
- Name: ${scheme.name}
- Ministry/Department: ${scheme.provider}
- Level: ${scheme.government_level}
- Target States: ${scheme.states.join(", ")}
- Categories: ${scheme.categories.join(", ")}
- Beneficiary Groups: ${scheme.beneficiary_groups.join(", ")}
- Age Rules: Min ${scheme.age_rules?.min_age ?? "None"}, Max ${scheme.age_rules?.max_age ?? "None"} (${scheme.age_rules?.description ?? ""})
- Income Rules: Max Annual Income ${scheme.income_rules?.max_annual_income ? "₹" + scheme.income_rules.max_annual_income : "None"} (${scheme.income_rules?.description ?? ""})
- Benefits Documented: ${scheme.benefits.map((b) => b.amount_or_details).join("; ")}
- Required Documents: ${scheme.documents.map((d) => d.name).join(", ")}
- Application Process: ${scheme.application_process.mode || "Online/Offline"} (URL: ${scheme.source_url || "N/A"})
- Raw description: ${scheme.description}

Citizen's Context (if provided):
- User stated requirement: ${userQuery || "General discovery"}
- Extracted facts: ${JSON.stringify(userProfile?.facts || [])}

Provide a conscious, actionable JSON extraction adhering exactly to this format:
{
  "eligibilityStatus": "Likely Eligible" | "Conditionally Eligible" | "Likely Ineligible" | "Open to All Eligible Citizens",
  "eligibilityReasoning": "2-3 clear sentences explaining why the citizen matches or what condition they must verify.",
  "consciousSummary": "Plain language explanation of what this scheme does, who benefits, and why it was introduced.",
  "financialAndMaterialBenefits": ["Clear bullet points of financial assistance, equipment, grants, subsidies, or coverage"],
  "essentialDocumentsChecklist": [
    { "document": "Aadhaar Card", "importance": "Mandatory", "notes": "Must be linked to mobile number and bank account" }
  ],
  "stepByStepApplication": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "crucialWarningsAndTips": ["Tip/Trap 1", "Tip/Trap 2"]
}
`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const rawText = response.text || "{}";
          const parsed = JSON.parse(rawText);

          const result: AiSchemeGuidanceResponse = {
            schemeId: scheme.id,
            schemeName: scheme.name,
            eligibilityStatus: parsed.eligibilityStatus || "Conditionally Eligible",
            eligibilityReasoning:
              parsed.eligibilityReasoning || "Review individual criteria with official portal.",
            consciousSummary: parsed.consciousSummary || scheme.description,
            financialAndMaterialBenefits:
              Array.isArray(parsed.financialAndMaterialBenefits) &&
              parsed.financialAndMaterialBenefits.length > 0
                ? parsed.financialAndMaterialBenefits
                : scheme.benefits.map((b) => b.amount_or_details),
            essentialDocumentsChecklist:
              Array.isArray(parsed.essentialDocumentsChecklist) &&
              parsed.essentialDocumentsChecklist.length > 0
                ? parsed.essentialDocumentsChecklist
                : scheme.documents.map((d) => ({
                    document: d.name,
                    importance: d.is_mandatory ? "Mandatory" : "Recommended",
                    notes: "Official certificate",
                  })),
            stepByStepApplication:
              Array.isArray(parsed.stepByStepApplication) && parsed.stepByStepApplication.length > 0
                ? parsed.stepByStepApplication
                : ["Apply through the official department portal or nearest CSC centre."],
            crucialWarningsAndTips:
              Array.isArray(parsed.crucialWarningsAndTips) &&
              parsed.crucialWarningsAndTips.length > 0
                ? parsed.crucialWarningsAndTips
                : ["Ensure all certificates are up-to-date and names match exactly on all IDs."],
            officialPortalUrl: scheme.source_url,
          };

          return Response.json({ guidance: result, source: "gemini-3.8-flash" });
        } catch (error: any) {
          console.warn(
            "AI Guidance extraction warning (using synthesized fallback):",
            error?.message,
          );
          const fallback: AiSchemeGuidanceResponse = {
            schemeId: scheme.id,
            schemeName: scheme.name,
            eligibilityStatus: "Conditionally Eligible",
            eligibilityReasoning: `Eligibility is determined by age, income, and state residency rules set by ${scheme.provider}. Verify criteria before application.`,
            consciousSummary: scheme.description || scheme.name,
            financialAndMaterialBenefits: scheme.benefits.map((b) => b.amount_or_details),
            essentialDocumentsChecklist: scheme.documents.map((d) => ({
              document: d.name,
              importance: d.is_mandatory ? "Mandatory" : "Recommended",
              notes:
                d.alternative_acceptable.length > 0
                  ? `Alternatives: ${d.alternative_acceptable.join(", ")}`
                  : "Standard certified copy required",
            })),
            stepByStepApplication: [
              "Verify required identity & residency documentation.",
              `Submit application via ${scheme.application_process.mode || "Official Portal / Local Government Office"}.`,
              scheme.source_url
                ? `Visit official scheme portal: ${scheme.source_url}`
                : "Track application with the nodal office.",
            ],
            crucialWarningsAndTips: [
              "Ensure bank account is Aadhaar-seeded for direct DBT transfers.",
              "Keep physical receipt or digital application acknowledgement number safe.",
            ],
            officialPortalUrl: scheme.source_url,
          };
          return Response.json({ guidance: fallback, source: "synthesized-fallback" });
        }
      },
    },
  },
});
