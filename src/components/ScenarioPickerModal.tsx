import React from "react";
import { TestScenario, SYNTHETIC_TEST_SCENARIOS } from "../data/syntheticScenarios";
import { X, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

interface ScenarioPickerModalProps {
  onSelectScenario: (scenario: TestScenario) => void;
  onClose: () => void;
}

export const ScenarioPickerModal: React.FC<ScenarioPickerModalProps> = ({
  onSelectScenario,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                10 Real-World Synthetic Test Scenarios (QA Suite)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pre-configured test personas spanning education, agriculture, housing, business,
                health, and welfare.
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

        {/* Scenarios Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SYNTHETIC_TEST_SCENARIOS.map((scen, idx) => (
            <div
              key={scen.id}
              onClick={() => {
                onSelectScenario(scen);
                onClose();
              }}
              className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 hover:shadow-xs transition-all cursor-pointer bg-white group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                  <span className="font-mono uppercase">Scenario 0{idx + 1}</span>
                  <span className="text-amber-800 font-medium">{scen.category}</span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 group-hover:text-black leading-snug">
                  {scen.title}
                </h3>

                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100 italic">
                  &ldquo;{scen.query}&rdquo;
                </p>

                <p className="text-[11px] text-stone-500 mt-2">
                  <span className="font-semibold text-stone-700">Verification Goal: </span>
                  {scen.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-400 truncate max-w-[220px]">
                  Target: {scen.expectedMatches[0]}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-stone-900 group-hover:translate-x-0.5 transition-transform text-xs">
                  <span>Load Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Click any scenario to immediately populate the profile and run search &amp; reasoning.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
