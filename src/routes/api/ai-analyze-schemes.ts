import { createFileRoute } from "@tanstack/react-router";
import { ai } from "../../lib/gemini";
import { AiSchemeAnalysisResult, AiConciseSchemeInfo } from "../../types/scheme";

export const Route = createFileRoute("/api/ai-analyze-schemes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let userQuery = "";
        let userProfile: any = undefined;
        let schemes: any[] = [];
        const fallbackConciseSchemes: Record<string, AiConciseSchemeInfo> = {};

        try {
          const body = await request.json();
          userQuery = body?.userQuery || "";
          userProfile = body?.userProfile;
          schemes = Array.isArray(body?.schemes) ? body.schemes : [];

          if (schemes.length === 0) {
            return Response.json({
              topSchemeId: null,
              popReason: "No candidate schemes available.",
              conciseSchemes: {},
            });
          }

          // Build instantaneous, resilient concise fallback for all schemes
          schemes.forEach((s: any) => {
            const benefit =
              s.benefits?.[0]?.amount_or_details ||
              s.benefits?.[0]?.description ||
              "Government welfare assistance";
            const summary =
              s.description && s.description.length > 20
                ? s.description.split(".")[0] + "."
                : `${s.name} is an official welfare initiative provided by ${s.provider || "the government"}.`;

            fallbackConciseSchemes[s.id] = {
              schemeId: s.id,
              conciseSummary: summary,
              conciseBenefit: benefit,
              whyRequired: userQuery
                ? `Matches your requirement for ${s.categories?.join(", ") || "support"}.`
                : "High relevance to your profile criteria.",
              keyEligibility: `Administered by ${s.provider || "Government Department"}.`,
            };
          });

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            const result: AiSchemeAnalysisResult = {
              topSchemeId: schemes[0]?.id || null,
              popReason: userQuery
                ? `Identified as the highest-priority scheme matching "${userQuery}".`
                : "Top recommended scheme based on your profile.",
              conciseSchemes: fallbackConciseSchemes,
            };
            return Response.json(result);
          }

          // Build prompt for Gemini 3.8 Flash to analyze schemes and create concise summaries
          const schemeSnippets = schemes.slice(0, 10).map((s: any) => ({
            id: s.id,
            name: s.name,
            provider: s.provider,
            categories: s.categories,
            benefit: s.benefits?.[0]?.amount_or_details || "",
            description: (s.description || "").slice(0, 200),
          }));

          const prompt = `
You are SchemeSaar's AI Scheme Discovery Engine.
A citizen has described their requirement: "${userQuery || "General welfare inquiry"}".
Context / Stated Facts: ${JSON.stringify(userProfile?.facts || [])}

Candidate Schemes in database:
${JSON.stringify(schemeSnippets, null, 2)}

TASK:
1. Identify the single best scheme that should "pop up" as the primary requirement for this citizen ("topSchemeId").
2. Give a 1-sentence plain-language explanation of why this particular scheme popped up for them ("popReason").
3. For EACH scheme in the list, generate ultra-concise, crystal-clear information:
   - "conciseSummary": 1-2 sentences maximum in plain words (no government bureaucratic jargon). Explain what the citizen gets.
   - "conciseBenefit": 1 direct line summarizing the financial/material assistance (e.g., "₹6,000/year via direct bank transfer").
   - "whyRequired": 1 concise sentence explaining how it answers their specific situation.
   - "keyEligibility": 1 concise sentence on the primary eligibility hurdle.

Respond with strict JSON adhering to:
{
  "topSchemeId": "scheme-id-here",
  "popReason": "1 sentence why it popped up for this user",
  "conciseSchemes": [
    {
      "schemeId": "id",
      "conciseSummary": "1-2 concise sentences",
      "conciseBenefit": "1 direct benefit line",
      "whyRequired": "1 sentence why it matches their need",
      "keyEligibility": "1 sentence on primary condition"
    }
  ]
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

          const conciseMap: Record<string, AiConciseSchemeInfo> = { ...fallbackConciseSchemes };
          if (Array.isArray(parsed.conciseSchemes)) {
            parsed.conciseSchemes.forEach((item: any) => {
              if (item.schemeId) {
                conciseMap[item.schemeId] = {
                  schemeId: item.schemeId,
                  conciseSummary:
                    item.conciseSummary || fallbackConciseSchemes[item.schemeId]?.conciseSummary,
                  conciseBenefit:
                    item.conciseBenefit || fallbackConciseSchemes[item.schemeId]?.conciseBenefit,
                  whyRequired:
                    item.whyRequired || fallbackConciseSchemes[item.schemeId]?.whyRequired,
                  keyEligibility:
                    item.keyEligibility || fallbackConciseSchemes[item.schemeId]?.keyEligibility,
                };
              }
            });
          }

          const finalResult: AiSchemeAnalysisResult = {
            topSchemeId: parsed.topSchemeId || schemes[0]?.id || null,
            popReason:
              parsed.popReason ||
              `Selected by AI as the most suitable match for your stated requirement.`,
            conciseSchemes: conciseMap,
          };

          return Response.json(finalResult);
        } catch (error: any) {
          console.warn("AI scheme analysis fallback:", error?.message);
          return Response.json({
            topSchemeId: schemes[0]?.id || null,
            popReason: userQuery
              ? `Identified as the highest-priority match for "${userQuery}".`
              : "Recommended based on your profile criteria.",
            conciseSchemes: fallbackConciseSchemes,
          });
        }
      },
    },
  },
});
