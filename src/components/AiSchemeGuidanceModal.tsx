import React, { useState, useEffect } from "react";
import { SchemeRecord, UserProfile } from "../types/scheme";
import { AiSchemeGuidanceResponse } from "../routes/api/ai-scheme-guidance";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Send,
  ExternalLink,
  ShieldCheck,
  Compass,
  Coins,
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Info,
} from "lucide-react";

interface AiSchemeGuidanceModalProps {
  scheme: SchemeRecord | null;
  userProfile?: UserProfile | null;
  userQuery?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AiSchemeGuidanceModal: React.FC<AiSchemeGuidanceModalProps> = ({
  scheme,
  userProfile,
  userQuery,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"guidance" | "chat">("guidance");
  const [guidance, setGuidance] = useState<AiSchemeGuidanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>(
    [],
  );
  const [inputQuestion, setInputQuestion] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !scheme) {
      setGuidance(null);
      setChatMessages([]);
      setError(null);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetch("/api/ai-scheme-guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheme, userProfile, userQuery }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        if (data.guidance) {
          setGuidance(data.guidance);
        } else {
          setError("Could not extract AI guidance for this scheme.");
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("AI Guidance fetch error:", err);
        setError("Failed to generate AI guidance. Please try again.");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, scheme, userProfile, userQuery]);

  if (!isOpen || !scheme) return null;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isChatLoading) return;

    const question = inputQuestion.trim();
    const updatedHistory = [...chatMessages, { role: "user" as const, text: question }];
    setChatMessages(updatedHistory);
    setInputQuestion("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai-scheme-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme,
          question,
          conversationHistory: updatedHistory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setChatMessages([...updatedHistory, { role: "model" as const, text: data.answer }]);
      } else {
        setChatMessages([
          ...updatedHistory,
          {
            role: "model" as const,
            text:
              data.error ||
              "Sorry, I could not answer at this moment. Please check the official portal.",
          },
        ]);
      }
    } catch (err: any) {
      setChatMessages([
        ...updatedHistory,
        {
          role: "model" as const,
          text: "Network error occurred while contacting AI service.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Likely Eligible":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Likely Eligible
          </span>
        );
      case "Conditionally Eligible":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Info className="w-3.5 h-3.5 text-amber-700" />
            Conditionally Eligible
          </span>
        );
      case "Likely Ineligible":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Likely Ineligible
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Open for Eligible Citizens
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-stone-900 text-amber-400 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight line-clamp-1">
                  {scheme.name}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 truncate max-w-lg">
                {scheme.provider} · {scheme.government_level} Level
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2 border-b border-stone-100 flex items-center gap-2 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("guidance")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "guidance"
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>AI Conscious Guidance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "chat"
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Questions ({chatMessages.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === "guidance" && (
            <div className="space-y-6">
              {isLoading && (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  <div className="text-sm font-semibold text-stone-800">
                    Extracting conscious scheme intelligence with Gemini AI...
                  </div>
                  <p className="text-xs text-stone-500 max-w-sm">
                    Analyzing eligibility rules, financial benefits, required documents, and
                    application steps tailored to citizen context.
                  </p>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {guidance && !isLoading && (
                <div className="space-y-5 text-xs text-stone-700">
                  {/* Eligibility Verdict Card */}
                  <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-stone-900 text-sm">
                        Conscious Eligibility Verdict
                      </span>
                      {getStatusBadge(guidance.eligibilityStatus)}
                    </div>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      {guidance.eligibilityReasoning}
                    </p>
                  </div>

                  {/* Plain Language Summary */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-stone-600" />
                      What This Scheme Truly Offers
                    </h3>
                    <p className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-stone-800 leading-relaxed">
                      {guidance.consciousSummary}
                    </p>
                  </div>

                  {/* Financial & Material Benefits */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      Exact Benefits &amp; Financial Assistance
                    </h3>
                    <ul className="space-y-1.5">
                      {guidance.financialAndMaterialBenefits.map((b, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-2.5 bg-white border border-stone-200/80 rounded-xl"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-stone-800">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents Checklist */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Essential Documents Checklist
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {guidance.essentialDocumentsChecklist.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-stone-200/80 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900">{doc.document}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                doc.importance === "Mandatory"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {doc.importance}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">{doc.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Application */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Step-by-Step Application Walkthrough
                    </h3>
                    <div className="space-y-2">
                      {guidance.stepByStepApplication.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-stone-800 font-medium leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crucial Warnings and Tips */}
                  {guidance.crucialWarningsAndTips.length > 0 && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5">
                      <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        Important Caveats &amp; Common Pitfalls
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11px] leading-relaxed">
                        {guidance.crucialWarningsAndTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Official Portal Button */}
                  {scheme.source_url && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={scheme.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Official Government Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-700 leading-relaxed">
                  👋 <strong>AI Scheme Assistant:</strong> Ask any specific question regarding{" "}
                  <strong>{scheme.name}</strong> — such as document requirements, eligibility
                  nuances, bank seeding, or application processing times.
                </div>

                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-stone-900 text-white"
                          : "bg-white border border-stone-200 text-stone-800 shadow-2xs whitespace-pre-wrap"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 text-stone-600 rounded-2xl p-3 text-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Consulting scheme guidelines with Gemini...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChat} className="pt-3 border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={`Ask a question about ${scheme.name}...`}
                  className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isChatLoading}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
