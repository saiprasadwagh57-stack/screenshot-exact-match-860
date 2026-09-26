import React, { useState } from "react";
import { CandidateScheme, CriterionEvaluation } from "../types/scheme";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Code2,
  ExternalLink,
} from "lucide-react";

interface EvidenceDrawerProps {
  candidate: CandidateScheme | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ candidate, onClose }) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!candidate) return null;

  const renderStatusBadge = (status: CriterionEvaluation["status"]) => {
    switch (status) {
      case "SATISFIED":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SATISFIED</span>
          </span>
        );
      case "NOT_SATISFIED":
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>NOT SATISFIED</span>
          </span>
        );
      case "CONFLICTING_DATA":
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 font-medium text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CONFLICTING DATA</span>
          </span>
        );
      case "UNKNOWN":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-stone-200 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div>
            <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
              Traceability &amp; Evidence Audit
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-tight">
              {candidate.scheme.name}
            </h2>
            <div className="text-xs text-stone-500 mt-1">
              <span>{candidate.scheme.provider}</span>
              <span className="mx-1.5">·</span>
              <span>Guidance State: </span>
              <span className="font-semibold text-stone-900">{candidate.match_state}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Audit Chain Diagram */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
            <div className="text-xs font-semibold text-stone-800 mb-2">
              Decision Audit Chain (Zero Hallucination Guarantee)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs text-center font-medium">
              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-400 block uppercase font-mono">
                  1. User Fact
                </span>
                <span className="text-stone-800 text-[11px] mt-0.5 block truncate">
                  Stated Profile
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-400 block uppercase font-mono">
                  2. Match Criterion
                </span>
                <span className="text-stone-800 text-[11px] mt-0.5 block truncate">
                  Verified Rules
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-400 block uppercase font-mono">
                  3. DB Record
                </span>
                <span className="text-stone-800 text-[11px] mt-0.5 block truncate">
                  Official Field
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs">
                <span className="text-[10px] text-stone-400 block uppercase font-mono">
                  4. Result
                </span>
                <span className="text-stone-800 text-[11px] mt-0.5 block truncate">
                  {candidate.match_state}
                </span>
              </div>
            </div>
          </div>

          {/* Why it appeared */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Retrieval Explanation
            </h3>
            <p className="text-sm text-stone-700 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 leading-relaxed">
              {candidate.why_relevant}
            </p>
          </div>

          {/* Criterion-by-Criterion Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Criterion-by-Criterion Evaluation
              </h3>
              <span className="text-[11px] text-stone-400 font-normal">
                {candidate.criteria.length} Documented Criteria
              </span>
            </div>

            <div className="space-y-3">
              {candidate.criteria.map((crit, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 text-sm">
                      {crit.criterion_name}
                    </span>
                    {renderStatusBadge(crit.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 block">Required by Scheme:</span>
                      <span className="text-stone-700 font-medium">{crit.required_value}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">User Stated Fact:</span>
                      <span className="text-stone-700 font-medium">{crit.user_value}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                    <span className="font-medium text-stone-700">Evidence: </span>
                    {crit.evidence}
                  </div>

                  <div className="text-[10px] text-stone-400 font-mono flex items-center justify-between pt-1">
                    <span>Source Field: {crit.source_scheme_field}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Source & Verification Note */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="font-semibold">Official Verification Notice</div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              {candidate.verification_note} SchemeSaar provides guidance based on available database
              records. Final eligibility and approval are determined exclusively by the relevant
              scheme authority ({candidate.scheme.provider}).
            </p>
            {candidate.source.url && (
              <a
                href={candidate.source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-amber-950 underline hover:text-black mt-1"
              >
                <span>Visit Official Scheme Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Raw Database Record Inspector */}
          <div className="border-t border-stone-200 pt-4">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-stone-500" />
              <span>
                {showRawJson ? "Hide Raw Database Record" : "Inspect Raw Database Record"}
              </span>
            </button>

            {showRawJson && (
              <pre className="mt-3 p-4 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(candidate.scheme.raw_record, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
