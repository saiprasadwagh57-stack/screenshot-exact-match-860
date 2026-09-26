import React, { useState } from "react";
import { CandidateScheme, SchemeRecord, AiConciseSchemeInfo } from "../types/scheme";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Coins,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";

interface SchemeCardProps {
  candidate: CandidateScheme;
  conciseInfo?: AiConciseSchemeInfo;
  onOpenEvidence: (candidate: CandidateScheme) => void;
  onOpenAiGuidance?: (scheme: SchemeRecord) => void;
  onRefineResult?: (candidate: CandidateScheme) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (candidate: CandidateScheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  candidate,
  conciseInfo,
  onOpenEvidence,
  onOpenAiGuidance,
  onRefineResult,
  isSelectedForCompare,
  onToggleCompare,
}) => {
  const [expanded, setExpanded] = useState(false);

  const {
    scheme,
    match_state,
    why_relevant,
    criteria,
    benefits,
    documents,
    application,
    freshness,
  } = candidate;

  // Guidance status style mapping
  const getMatchStateUI = () => {
    switch (match_state) {
      case "LIKELY MATCH":
        return {
          textColor: "text-emerald-800",
          bgColor: "bg-emerald-50/90 border-emerald-200/80",
          dotColor: "bg-emerald-500",
          label: "Likely Match",
          subtext: "Available information satisfies documented relevant criteria",
        };
      case "POTENTIAL MATCH":
        return {
          textColor: "text-amber-800",
          bgColor: "bg-amber-50/90 border-amber-200/80",
          dotColor: "bg-amber-500",
          label: "Potential Match",
          subtext: "Several criteria match; some information remains unknown",
        };
      case "MORE INFORMATION NEEDED":
        return {
          textColor: "text-stone-800",
          bgColor: "bg-stone-100 border-stone-200",
          dotColor: "bg-stone-400",
          label: "More Information Needed",
          subtext: "Scheme appears relevant but a decisive fact is missing",
        };
      case "DOES NOT APPEAR TO MATCH":
      default:
        return {
          textColor: "text-rose-800",
          bgColor: "bg-rose-50/90 border-rose-200/80",
          dotColor: "bg-rose-500",
          label: "Does Not Appear to Match",
          subtext: "Explicit criteria conflict with current user information",
        };
    }
  };

  const matchUI = getMatchStateUI();
  const satisfiedCriteria = criteria.filter((c) => c.status === "SATISFIED");
  const unknownCriteria = criteria.filter((c) => c.status === "UNKNOWN");

  // Concise texts
  const conciseSummary =
    conciseInfo?.conciseSummary ||
    (scheme.description && scheme.description.length > 20
      ? scheme.description.slice(0, 160) + (scheme.description.length > 160 ? "..." : "")
      : `${scheme.name} provides welfare assistance to eligible beneficiaries under ${scheme.provider}.`);

  const conciseBenefit =
    conciseInfo?.conciseBenefit ||
    benefits[0]?.amount_or_details ||
    benefits[0]?.description ||
    "Official Government Benefit";

  const conciseWhy = conciseInfo?.whyRequired || why_relevant;

  return (
    <div
      className={`rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
        isSelectedForCompare
          ? "border-stone-900 ring-2 ring-stone-900/10 shadow-sm"
          : "border-stone-200/90 hover:border-stone-300 shadow-xs hover:shadow-sm"
      }`}
    >
      {/* Top Match Status Banner */}
      <div
        className={`px-5 py-2.5 border-b flex items-center justify-between gap-3 ${matchUI.bgColor}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${matchUI.dotColor}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${matchUI.textColor}`}>
            {matchUI.label}
          </span>
          <span className="text-[11px] text-stone-500 hidden md:inline">· {matchUI.subtext}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Comparison checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(candidate)}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 w-3.5 h-3.5"
            />
            <span className="hidden sm:inline">Compare</span>
          </label>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500 font-normal">
          <span>{scheme.categories.join(", ")}</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.government_level} Level</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.states.join(", ")}</span>
          {freshness && (
            <>
              <span aria-hidden="true">·</span>
              <span>Updated {freshness}</span>
            </>
          )}
        </div>

        {/* Title and Provider */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
            {scheme.name}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">{scheme.provider}</p>
        </div>

        {/* FIRSTLY: CONCISE INFO SECTION */}
        <div className="space-y-2.5 text-xs">
          {/* AI Concise Summary Box */}
          <div className="p-3.5 bg-stone-50/90 rounded-xl border border-stone-200/70 text-stone-800 space-y-1.5">
            <div className="flex items-center gap-1 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Concise Summary</span>
            </div>
            <p className="leading-relaxed font-normal">{conciseSummary}</p>
          </div>

          {/* Key Benefit in 1 Direct Line */}
          <div className="flex items-start gap-2 p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
            <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
                Direct Benefit / Assistance
              </span>
              <span className="text-xs font-semibold text-stone-900">{conciseBenefit}</span>
            </div>
          </div>

          {/* Why It Is Required / Matches */}
          <div className="flex items-start gap-2 px-1 text-stone-600 text-xs">
            <span className="font-semibold text-stone-800 shrink-0">Why required:</span>
            <span className="leading-relaxed">{conciseWhy}</span>
          </div>
        </div>

        {/* "Answer one more question" refinement if applicable */}
        {unknownCriteria.length >= 1 && unknownCriteria.length <= 2 && onRefineResult && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center justify-between gap-3 text-xs">
            <span className="text-amber-900">
              Clarify {unknownCriteria[0]?.criterion_name} to confirm qualification.
            </span>
            <button
              onClick={() => onRefineResult(candidate)}
              className="px-2.5 py-1 bg-amber-900 text-white font-medium rounded-lg hover:bg-black transition-colors cursor-pointer text-[11px] shrink-0"
            >
              Answer question
            </button>
          </div>
        )}

        {/* EXPANDED DETAILED INFORMATION SECTION */}
        {expanded && (
          <div className="pt-4 border-t border-stone-200/80 space-y-4 text-xs animate-in fade-in duration-200">
            {/* Criteria Evaluation Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-semibold text-stone-800 block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Criteria ({satisfiedCriteria.length})</span>
                </span>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  {satisfiedCriteria.slice(0, 4).map((c, idx) => (
                    <li key={idx} className="truncate">
                      • {c.criterion_name}: {c.user_value}
                    </li>
                  ))}
                  {satisfiedCriteria.length === 0 && (
                    <li className="text-stone-400 italic">No specific criteria confirmed yet</li>
                  )}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-stone-800 block mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unverified Criteria ({unknownCriteria.length})</span>
                </span>
                <ul className="space-y-1 text-stone-600 text-[11px]">
                  {unknownCriteria.slice(0, 3).map((c, idx) => (
                    <li key={idx} className="truncate">
                      • {c.criterion_name} ({c.required_value})
                    </li>
                  ))}
                  {unknownCriteria.length === 0 && (
                    <li className="text-emerald-700 font-medium">All relevant criteria verified</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Essential Required Documents */}
            {documents.length > 0 && (
              <div>
                <span className="font-semibold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Required Documents Checklist</span>
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {documents.map((doc, dIdx) => (
                    <div
                      key={dIdx}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700"
                    >
                      <span className="font-medium text-stone-900">{doc.name}</span>
                      {doc.mandatory && (
                        <span className="text-rose-600 text-[10px] ml-1 font-semibold">
                          *Mandatory
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Application */}
            {application.steps.length > 0 && (
              <div>
                <span className="font-semibold text-stone-800 block mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-stone-700" />
                  <span>Step-by-Step How to Apply</span>
                </span>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 text-[11px] leading-relaxed">
                  {application.steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* FOOTER ACTIONS: VIEW DETAILED BUTTON FIRST */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* PRIMARY: View Detailed Information Toggle */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                expanded
                  ? "bg-stone-200 text-stone-900"
                  : "bg-stone-900 text-white hover:bg-stone-800 shadow-2xs"
              }`}
            >
              <span>{expanded ? "Collapse Details" : "View Detailed Information"}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* AI Deep Consultation & Interactive Chat */}
            {onOpenAiGuidance && (
              <button
                type="button"
                onClick={() => onOpenAiGuidance(scheme)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Open comprehensive AI analysis & ask questions"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Guidance &amp; Chat</span>
              </button>
            )}

            <button
              onClick={() => onOpenEvidence(candidate)}
              className="text-xs text-stone-500 hover:text-stone-900 hover:underline cursor-pointer"
            >
              Why this appeared
            </button>
          </div>

          {/* Official Apply / Source Link */}
          {candidate.source.url ? (
            <a
              href={candidate.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </a>
          ) : (
            <span className="text-[11px] text-stone-400">Apply via District / Block Office</span>
          )}
        </div>
      </div>
    </div>
  );
};
