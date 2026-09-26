import React, { useState } from 'react';
import { CandidateScheme } from '../types/scheme';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Calendar,
  Layers,
} from 'lucide-react';

interface SchemeCardProps {
  candidate: CandidateScheme;
  onOpenEvidence: (candidate: CandidateScheme) => void;
  onRefineResult?: (candidate: CandidateScheme) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (candidate: CandidateScheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  candidate,
  onOpenEvidence,
  onRefineResult,
  isSelectedForCompare,
  onToggleCompare,
}) => {
  const [expanded, setExpanded] = useState(false);

  const { scheme, match_state, why_relevant, criteria, benefits, documents, application, freshness } = candidate;

  // Guidance status style mapping
  const getMatchStateUI = () => {
    switch (match_state) {
      case 'LIKELY MATCH':
        return {
          textColor: 'text-emerald-800',
          bgColor: 'bg-emerald-50/90 border-emerald-200/80',
          dotColor: 'bg-emerald-500',
          label: 'Likely Match',
          subtext: 'Available information satisfies documented relevant criteria',
        };
      case 'POTENTIAL MATCH':
        return {
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50/90 border-amber-200/80',
          dotColor: 'bg-amber-500',
          label: 'Potential Match',
          subtext: 'Several criteria match; some information remains unknown',
        };
      case 'MORE INFORMATION NEEDED':
        return {
          textColor: 'text-stone-800',
          bgColor: 'bg-stone-100 border-stone-200',
          dotColor: 'bg-stone-400',
          label: 'More Information Needed',
          subtext: 'Scheme appears relevant but a decisive fact is missing',
        };
      case 'DOES NOT APPEAR TO MATCH':
      default:
        return {
          textColor: 'text-rose-800',
          bgColor: 'bg-rose-50/90 border-rose-200/80',
          dotColor: 'bg-rose-500',
          label: 'Does Not Appear to Match',
          subtext: 'Explicit criteria conflict with current user information',
        };
    }
  };

  const matchUI = getMatchStateUI();
  const satisfiedCriteria = criteria.filter((c) => c.status === 'SATISFIED');
  const unknownCriteria = criteria.filter((c) => c.status === 'UNKNOWN');
  const notSatisfiedCriteria = criteria.filter((c) => c.status === 'NOT_SATISFIED');

  return (
    <div
      className={`rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
        isSelectedForCompare
          ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-sm'
          : 'border-stone-200/90 hover:border-stone-300 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Top Match Status Banner */}
      <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${matchUI.bgColor}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${matchUI.dotColor}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${matchUI.textColor}`}>
            {matchUI.label}
          </span>
          <span className="text-[11px] text-stone-500 hidden md:inline">
            · {matchUI.subtext}
          </span>
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
        {/* Unboxed Metadata Line — Zero-pill discipline */}
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-stone-500 font-normal">
          <span>{scheme.categories.join(', ')}</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.government_level} Level</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.states.join(', ')}</span>
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
          <p className="text-xs text-stone-500 mt-1">
            {scheme.provider}
          </p>
        </div>

        {/* Concise Reason for Matching */}
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal bg-stone-50/70 p-3 rounded-xl border border-stone-100">
          <span className="font-semibold text-stone-900">Why it matches: </span>
          {why_relevant}
        </p>

        {/* Primary Benefit Callout */}
        {benefits.length > 0 && (
          <div className="py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
              Key Benefit / Assistance
            </span>
            <div className="text-sm font-semibold text-stone-900">
              {benefits[0]?.amount_or_details}
            </div>
            {benefits[0]?.description && (
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                {benefits[0]?.description}
              </p>
            )}
          </div>
        )}

        {/* Eligibility Snapshot Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
          {/* Satisfied criteria summary */}
          <div>
            <span className="font-semibold text-stone-700 block mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Satisfied Criteria ({satisfiedCriteria.length})</span>
            </span>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              {satisfiedCriteria.slice(0, 3).map((c, idx) => (
                <li key={idx} className="truncate">
                  • {c.criterion_name}: {c.user_value}
                </li>
              ))}
              {satisfiedCriteria.length === 0 && (
                <li className="text-stone-400 italic">No criteria confirmed yet</li>
              )}
            </ul>
          </div>

          {/* Unknown / Missing criteria summary */}
          <div>
            <span className="font-semibold text-stone-700 block mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Unknown / Unverified ({unknownCriteria.length})</span>
            </span>
            <ul className="space-y-1 text-stone-600 text-[11px]">
              {unknownCriteria.slice(0, 2).map((c, idx) => (
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

        {/* "Answer one more question to refine this result" if 1 or 2 unknowns exist */}
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

        {/* Expandable Details Section */}
        {expanded && (
          <div className="pt-4 border-t border-stone-100 space-y-4 text-xs animate-in fade-in duration-150">
            {/* Documents Required */}
            <div>
              <span className="font-semibold text-stone-800 block mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Required Documents</span>
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {documents.map((doc, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-700"
                  >
                    <span className="font-medium text-stone-900">{doc.name}</span>
                    {doc.mandatory && (
                      <span className="text-rose-600 text-[10px] ml-1 font-semibold">*Mandatory</span>
                    )}
                    {doc.description && (
                      <p className="text-stone-500 text-[10px] mt-0.5">{doc.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Application Route */}
            {application.steps.length > 0 && (
              <div>
                <span className="font-semibold text-stone-800 block mb-1">
                  How to Apply
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

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{expanded ? 'Show Less' : 'Full Details & Documents'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-stone-300">·</span>

            {/* Expandable Evidence Drawer Trigger */}
            <button
              onClick={() => onOpenEvidence(candidate)}
              className="text-xs font-semibold text-stone-800 hover:text-black hover:underline cursor-pointer"
            >
              Why did this scheme appear?
            </button>
          </div>

          {/* Official Apply / Source Link */}
          {candidate.source.url ? (
            <a
              href={candidate.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3 text-stone-300" />
            </a>
          ) : (
            <span className="text-[11px] text-stone-400">
              Apply via District / Block Office
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
