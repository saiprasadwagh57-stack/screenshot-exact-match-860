import React from "react";
import { SchemeRecord, AiConciseSchemeInfo } from "../types/scheme";
import { Sparkles, Coins, ArrowRight, ShieldCheck, ExternalLink, X, Info } from "lucide-react";

interface AiPoppedUpSchemeBannerProps {
  scheme: SchemeRecord;
  popReason?: string;
  conciseInfo?: AiConciseSchemeInfo;
  onViewDetailed: (scheme: SchemeRecord) => void;
  onDismiss: () => void;
}

export const AiPoppedUpSchemeBanner: React.FC<AiPoppedUpSchemeBannerProps> = ({
  scheme,
  popReason,
  conciseInfo,
  onViewDetailed,
  onDismiss,
}) => {
  const summary =
    conciseInfo?.conciseSummary ||
    scheme.description.slice(0, 180) + (scheme.description.length > 180 ? "..." : "");
  const benefit =
    conciseInfo?.conciseBenefit ||
    scheme.benefits[0]?.amount_or_details ||
    "Government Financial / Material Welfare Benefit";
  const reason =
    popReason ||
    conciseInfo?.whyRequired ||
    "Identified as the highest-priority match for your stated situation.";

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-linear-to-br from-amber-50/90 via-orange-50/40 to-stone-50 p-5 sm:p-6 shadow-md transition-all animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-900 text-amber-50 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Required Scheme Selection</span>
        </div>

        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          title="Dismiss top recommendation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Scheme Identity */}
      <div className="space-y-1 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
          <span>{scheme.categories.join(", ")}</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.government_level} Level</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.provider}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
          {scheme.name}
        </h3>
      </div>

      {/* FIRSTLY: Concise Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
        {/* Concise AI Summary */}
        <div className="md:col-span-2 p-3.5 bg-white/90 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
          <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] flex items-center gap-1 text-amber-900">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            Concise Scheme Overview
          </span>
          <p className="text-stone-800 leading-relaxed font-normal">{summary}</p>
          <p className="text-[11px] text-amber-900 font-medium pt-1 border-t border-amber-100">
            <strong>Why it popped up:</strong> {reason}
          </p>
        </div>

        {/* Concise Key Benefit Callout */}
        <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between space-y-2">
          <div>
            <span className="font-bold text-stone-900 uppercase tracking-wider text-[10px] flex items-center gap-1 text-emerald-900 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Direct Benefit
            </span>
            <div className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
              {benefit}
            </div>
          </div>
          <div className="text-[10px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified Official Government Program</span>
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200/60">
        <span className="text-xs text-stone-600">
          Want complete eligibility rules, required documents &amp; application steps?
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetailed(scheme)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <span>View Detailed Information</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3 text-stone-500" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
