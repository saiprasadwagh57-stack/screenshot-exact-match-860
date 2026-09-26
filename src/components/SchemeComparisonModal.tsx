import React from 'react';
import { CandidateScheme } from '../types/scheme';
import { X, CheckCircle2, HelpCircle, XCircle, ExternalLink } from 'lucide-react';

interface SchemeComparisonModalProps {
  schemes: CandidateScheme[];
  onClose: () => void;
  onRemoveScheme: (id: string) => void;
}

export const SchemeComparisonModal: React.FC<SchemeComparisonModalProps> = ({
  schemes,
  onClose,
  onRemoveScheme,
}) => {
  if (schemes.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Compare Schemes ({schemes.length} of 4)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Side-by-side analysis of eligibility criteria, benefits, required documents, and application process.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
          <table className="w-full border-collapse text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="p-3 w-40 text-stone-400 font-semibold uppercase tracking-wider text-[11px] bg-stone-50/50">
                  Feature / Criterion
                </th>
                {schemes.map((s) => (
                  <th key={s.scheme.id} className="p-3 font-bold text-stone-900 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-stone-900">{s.scheme.name}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{s.scheme.provider}</div>
                      </div>
                      <button
                        onClick={() => onRemoveScheme(s.scheme.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {/* Guidance Match State */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Match State
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3">
                    <span className="font-bold text-stone-900 block text-xs">
                      {s.match_state}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {s.why_relevant}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Primary Benefit */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Financial Benefit / Assistance
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3">
                    <div className="font-semibold text-stone-900">
                      {s.benefits[0]?.amount_or_details || 'Refer guidelines'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {s.benefits[0]?.description}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Age & Income Limits */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Age &amp; Income Rules
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3 space-y-1">
                    <div>
                      <span className="text-stone-400 text-[10px] block">Age:</span>
                      <span className="text-stone-700">
                        {s.scheme.age_rules?.min_age || s.scheme.age_rules?.max_age
                          ? `${s.scheme.age_rules?.min_age || 0} to ${s.scheme.age_rules?.max_age || 'No limit'} yrs`
                          : 'No age limit specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Income Ceiling:</span>
                      <span className="text-stone-700">
                        {s.scheme.income_rules?.max_annual_income
                          ? `₹${s.scheme.income_rules.max_annual_income.toLocaleString('en-IN')}/yr`
                          : 'No explicit ceiling / Category based'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Geographic Coverage */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Applicable Region
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3 text-stone-700">
                    {s.scheme.states.join(', ')}
                  </td>
                ))}
              </tr>

              {/* Required Documents */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Key Documents
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3">
                    <ul className="space-y-1 text-stone-600 text-[11px]">
                      {s.documents.slice(0, 4).map((d, dIdx) => (
                        <li key={dIdx}>• {d.name}</li>
                      ))}
                      {s.documents.length > 4 && (
                        <li className="text-stone-400 italic">+{s.documents.length - 4} more</li>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Application Portal */}
              <tr>
                <td className="p-3 font-semibold text-stone-600 bg-stone-50/50">
                  Official Portal
                </td>
                {schemes.map((s) => (
                  <td key={s.scheme.id} className="p-3">
                    {s.source.url ? (
                      <a
                        href={s.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-stone-900 underline hover:text-stone-600"
                      >
                        <span>{s.source.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-stone-400">Offline / CSC Center</span>
                    )}
                    {s.freshness && (
                      <div className="text-[10px] text-stone-400 mt-1">
                        Updated {s.freshness}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Compare up to 4 schemes at once
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
