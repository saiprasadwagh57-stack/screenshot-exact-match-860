import React, { useState, forwardRef } from 'react';
import { Search, Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';

interface NaturalLanguageInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const EXAMPLE_QUERIES = [
  'I am a student and need help paying college fees.',
  'I want financial support to build my own house.',
  'I am a farmer and need help buying agricultural equipment.',
  'I am looking for a job.',
  'I want to start a small business.',
  'I am a worker and want to know what benefits I can receive.',
];

export const NaturalLanguageInput = forwardRef<HTMLTextAreaElement, NaturalLanguageInputProps>(
  ({ onSubmit, isLoading, initialValue = '' }, ref) => {
    const [query, setQuery] = useState(initialValue);

    const handleSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!query.trim() || isLoading) return;
      onSubmit(query.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleSelectExample = (example: string) => {
      setQuery(example);
      onSubmit(example);
    };

    return (
      <div className="w-full max-w-3xl mx-auto my-6 px-4">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-2xl border border-stone-200/90 shadow-sm focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200 transition-all p-3 sm:p-4"
        >
          <label htmlFor="user-need-input" className="sr-only">
            Tell us what you need
          </label>
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-stone-400 mt-1 shrink-0" />
            <textarea
              id="user-need-input"
              ref={ref}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell us what you need… (e.g., I am a student in Karnataka looking for college fee assistance, or I want to start a small business)"
              rows={3}
              className="w-full bg-transparent resize-none border-0 p-0 text-stone-900 placeholder:text-stone-400 text-sm sm:text-base leading-relaxed focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100">
            <span className="text-xs text-stone-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 rounded border border-stone-200 text-stone-600">Enter</kbd> to search
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-50 text-xs sm:text-sm font-medium rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Need...</span>
                  </>
                ) : (
                  <>
                    <span>Discover Schemes</span>
                    <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Example Queries */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-stone-400 shrink-0 font-medium">Try:</span>
          {EXAMPLE_QUERIES.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectExample(example)}
              className="shrink-0 px-2.5 py-1 text-stone-600 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70 rounded-md transition-colors cursor-pointer text-left"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

NaturalLanguageInput.displayName = 'NaturalLanguageInput';
