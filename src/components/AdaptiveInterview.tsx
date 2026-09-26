import React, { useState } from "react";
import { AdaptiveQuestion, ProfileFact, UserProfile } from "../types/scheme";
import { HelpCircle, ChevronRight, Check } from "lucide-react";

interface AdaptiveInterviewProps {
  questions: AdaptiveQuestion[];
  profile: UserProfile;
  onAnswerQuestion: (field: string, value: any, sourceText: string) => void;
  onDismissQuestion: (field: string) => void;
}

export const AdaptiveInterview: React.FC<AdaptiveInterviewProps> = ({
  questions,
  profile,
  onAnswerQuestion,
  onDismissQuestion,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  if (questions.length === 0) return null;

  const handleSelectOption = (field: string, value: any, label: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [field]: value }));
    onAnswerQuestion(field, value, `Adaptive question selected: "${label}"`);
  };

  const handleCustomSubmit = (e: React.FormEvent, q: AdaptiveQuestion) => {
    e.preventDefault();
    const val = customInputs[q.field];
    if (!val) return;

    let finalVal: any = val;
    if (q.inputType === "number") {
      const num = Number(val);
      if (!isNaN(num)) finalVal = num;
    }

    onAnswerQuestion(q.field, finalVal, `User entered response for ${q.field}`);
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-5 mb-8 shadow-2xs">
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
          Help Us Narrow Down Eligible Schemes
        </h3>
        <span className="text-[11px] text-stone-500 font-normal">· Adaptive Clarification</span>
      </div>
      <p className="text-xs text-stone-600 mb-4 font-normal">
        Based on available candidate schemes in the database, answering these {questions.length}{" "}
        question{questions.length > 1 ? "s" : ""} will eliminate uncertainty.
      </p>

      <div className="space-y-4">
        {questions.map((q) => {
          const isAnswered = profile.facts.some((f) => f.field === q.field);

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-stone-200/80 p-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="text-xs font-semibold text-stone-900">{q.questionText}</span>
                {q.helpText && (
                  <span className="text-[11px] text-stone-500 font-normal">{q.helpText}</span>
                )}
              </div>

              {/* Options if select */}
              {q.options && q.options.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.field, opt.value, opt.label)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-700 font-medium transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                /* Number / Text input */
                <form
                  onSubmit={(e) => handleCustomSubmit(e, q)}
                  className="flex items-center gap-2 mt-2 max-w-sm"
                >
                  <input
                    type={q.inputType === "number" ? "number" : "text"}
                    placeholder={`Enter ${q.field.replace(/_/g, " ")}...`}
                    value={customInputs[q.field] || ""}
                    onChange={(e) =>
                      setCustomInputs((prev) => ({ ...prev, [q.field]: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-900 text-stone-50 text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                </form>
              )}

              {/* Allow "I don't know" and "Prefer not to answer" as required by Prompt 2 */}
              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-3 text-[11px] text-stone-400">
                <button
                  type="button"
                  onClick={() => onDismissQuestion(q.field)}
                  className="hover:text-stone-700 transition-colors cursor-pointer"
                >
                  I don&apos;t know
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onDismissQuestion(q.field)}
                  className="hover:text-stone-700 transition-colors cursor-pointer"
                >
                  Prefer not to answer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
