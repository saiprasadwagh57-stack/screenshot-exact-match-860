import React from 'react';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

interface HeroProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onFocusInput: () => void;
  onExploreCategories: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onFocusInput,
  onExploreCategories,
}) => {
  return (
    <section className="pt-10 pb-8 text-center max-w-4xl mx-auto px-4">
      {/* Editorial Kicker */}
      <p className="text-xs uppercase tracking-widest font-medium text-amber-800 mb-3">
        Government Schemes &amp; Citizen Entitlements
      </p>

      {/* Main Blueprint Headline */}
      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15] mb-4">
        Find the schemes that fit your situation.
      </h1>

      {/* Subheadline */}
      <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
        Tell SchemeSaar what you need. We’ll search the available scheme database and explain the relevant options.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={onFocusInput}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Find My Schemes</span>
          <ArrowRight className="w-4 h-4 text-stone-300" />
        </button>

        <button
          onClick={onExploreCategories}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-stone-100 text-stone-800 font-medium text-sm rounded-xl border border-stone-200/90 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Compass className="w-4 h-4 text-stone-500" />
          <span>Explore Categories</span>
        </button>
      </div>

      {/* Category Shortcuts — only for categories actually represented in the dataset */}
      {categories.length > 0 && (
        <div className="pt-2 border-t border-stone-200/70">
          <div className="text-xs text-stone-500 mb-3">
            <span>Browse represented categories</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto">
            <button
              onClick={() => onSelectCategory('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'bg-stone-100/90 hover:bg-stone-200/80 text-stone-600'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-stone-50 shadow-xs'
                    : 'bg-stone-100/90 hover:bg-stone-200/80 text-stone-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
