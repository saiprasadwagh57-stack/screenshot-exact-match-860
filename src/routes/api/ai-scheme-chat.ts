import { createFileRoute } from "@tanstack/react-router";
import { ai } from "../../lib/gemini";
import { SchemeRecord } from "../../types/scheme";

export const Route = createFileRoute("/api/ai-scheme-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const {
            scheme,
            question,
            conversationHistory,
          }: {
            scheme: SchemeRecord;
            question: string;
            conversationHistory?: Array<{ role: "user" | "model"; text: string }>;
          } = body;

          if (!scheme || !question) {
            return Response.json(
              { error: "Scheme details and user question are required" },
              { status: 400 },
            );
          }

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            return Response.json({
              answer: `Regarding ${scheme.name}: The official provider is ${scheme.provider}. Please verify the specific criteria in the scheme guidelines or visit the official portal: ${scheme.source_url || "the national welfare directory"}.`,
              source: "fallback",
            });
          }

          const prompt = `
You are SchemeSaar's dedicated citizen assistant. The user is asking a specific question about the following government welfare scheme.

Scheme Information:
- Name: ${scheme.name}
- Provider: ${scheme.provider} (${scheme.government_level})
- States: ${scheme.states.join(", ")}
- Categories: ${scheme.categories.join(", ")}
- Benefits: ${scheme.benefits.map((b) => b.amount_or_details).join("; ")}
- Eligibility Rules:
  * Age: Min ${scheme.age_rules?.min_age ?? "None"}, Max ${scheme.age_rules?.max_age ?? "None"} (${scheme.age_rules?.description ?? ""})
  * Income: Max ₹${scheme.income_rules?.max_annual_income ?? "No ceiling"} (${scheme.income_rules?.description ?? ""})
  * Occupations: ${scheme.occupation_rules?.allowed_occupations?.join(", ") || "Any"}
  * Beneficiaries: ${scheme.beneficiary_groups.join(", ")}
- Documents Required: ${scheme.documents.map((d) => `${d.name} (${d.is_mandatory ? "Mandatory" : "Optional"})`).join(", ")}
- How to apply: ${scheme.application_process.mode || "Online/Offline"}
- Official Portal: ${scheme.source_url || "None provided"}
- Description: ${scheme.description}

Recent Context / Q&A:
${(conversationHistory || []).map((msg) => `${msg.role === "user" ? "Citizen" : "Advisor"}: ${msg.text}`).join("\n")}

Citizen Question: "${question}"

Provide a direct, conscious, accurate, and easy-to-understand answer in 2 to 4 concise paragraphs. Focus on practical next steps, documents, or eligibility clarification. If unsure or if a fact is not stated in official rules, clearly state that it depends on the local block/nodal officer.
`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              temperature: 0.3,
            },
          });

          return Response.json({
            answer:
              response.text ||
              "Could not generate an answer at this moment. Please check the official scheme documentation.",
            source: "gemini-3.8-flash",
          });
        } catch (error: any) {
          console.warn("AI Scheme Chat warning (falling back to guidelines):", error?.message);
          return Response.json({
            answer: `Regarding ${scheme.name}: The official provider is ${scheme.provider} (${scheme.government_level} level). Essential documents include ${
              scheme.documents
                .map((d) => d.name)
                .slice(0, 3)
                .join(", ") || "standard identity proof"
            }. For application queries, please refer to the official portal: ${scheme.source_url || "the national welfare directory"} or visit your nearest Common Service Centre (CSC).`,
            source: "guidance-fallback",
          });
        }
      },
    },
  },
});
