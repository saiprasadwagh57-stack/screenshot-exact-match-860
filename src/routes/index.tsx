import { useState, useRef, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "SchemeSaar — Find Government Schemes You Qualify For" },
      {
        name: "description",
        content:
          "Describe your situation in plain words and discover which Indian government schemes you likely qualify for, with evidence and guidance.",
      },
      { property: "og:title", content: "SchemeSaar — Find Government Schemes You Qualify For" },
      {
        property: "og:description",
        content:
          "Describe your situation in plain words and discover which Indian government schemes you likely qualify for.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
import {
  SchemeRecord,
  UserProfile,
  CandidateScheme,
  SearchFilters,
  OverallMatchState,
  AiSchemeAnalysisResult,
} from "@/types/scheme";
import { SchemeDataAdapter } from "@/services/schemeDataAdapter";
import { DEFAULT_SCHEMES_DATABASE } from "@/data/defaultSchemes";
import { SearchService } from "@/services/searchService";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NaturalLanguageInput } from "@/components/NaturalLanguageInput";
import { ProfileReview } from "@/components/ProfileReview";
import { AdaptiveInterview } from "@/components/AdaptiveInterview";
import { SchemeCard } from "@/components/SchemeCard";
import { AiPoppedUpSchemeBanner } from "@/components/AiPoppedUpSchemeBanner";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { SchemeComparisonModal } from "@/components/SchemeComparisonModal";
import { DatabaseManagerModal } from "@/components/DatabaseManagerModal";
import { AdminPasswordModal } from "@/components/AdminPasswordModal";
import { AiSchemeGuidanceModal } from "@/components/AiSchemeGuidanceModal";
import { AdminAuthService } from "@/services/adminAuthService";
import fullDbAsset from "@/assets/schemes.json.asset.json";
import {
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Database,
} from "lucide-react";

function App() {
  // Database state initialized to static defaults to match server-rendered markup
  const [database, setDatabase] = useState<SchemeRecord[]>(() => DEFAULT_SCHEMES_DATABASE);

  // Admin Authentication State (starts false for hydration parity, synced on mount)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);

  // AI Guidance Modal State
  const [selectedAiScheme, setSelectedAiScheme] = useState<SchemeRecord | null>(null);
  const [isAiGuidanceModalOpen, setIsAiGuidanceModalOpen] = useState(false);

  // AI Scheme Discovery & Concise Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AiSchemeAnalysisResult | null>(null);
  const [dismissedTopSchemeId, setDismissedTopSchemeId] = useState<string | null>(null);

  // Sync client storage and load server-persisted scheme database so all devices stay identical
  useEffect(() => {
    // Sync admin auth status from browser session
    setIsAdminAuthenticated(AdminAuthService.isAuthenticated());

    let cancelled = false;

    const loadServerDatabase = async () => {
      try {
        const res = await fetch("/api/schemes");
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          if (Array.isArray(data.schemes)) {
            setDatabase(data.schemes);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not fetch /api/schemes, trying fallback static assets:", e);
      }

      // Fallback to static asset if API endpoint had an issue
      try {
        let response = await fetch(fullDbAsset.url);
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.includes("json")) {
          response = await fetch(
            `https://id-preview--${fullDbAsset.project_id}.lovable.app${fullDbAsset.url}`,
          );
        }
        if (!response.ok) return;
        const full = (await response.json()) as SchemeRecord[];
        if (cancelled || !Array.isArray(full)) return;
        setDatabase(full);
      } catch (e) {
        console.warn("Failed to load fallback scheme database:", e);
      }
    };

    loadServerDatabase();
    return () => {
      cancelled = true;
    };
  }, []);

  // Input & Profile state
  const [inputText, setInputText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileReview, setShowProfileReview] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    category: "ALL",
    state: "ALL",
    provider_type: "ALL",
    match_state: "ALL",
    search_query: "",
  });

  // Modals and Drawers
  const [activeEvidenceScheme, setActiveEvidenceScheme] = useState<CandidateScheme | null>(null);
  const [comparedSchemeIds, setComparedSchemeIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Unique categories actually represented in current active database
  const representedCategories = useMemo(() => {
    const set = new Set<string>();
    database.forEach((s) => s.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [database]);

  // Unique states actually represented in current active database
  const representedStates = useMemo(() => {
    const set = new Set<string>();
    database.forEach((s) => s.states.forEach((st) => set.add(st)));
    return Array.from(set)
      .filter((st) => st !== "All-India")
      .sort();
  }, [database]);

  // Profile Extraction handler
  const handleAnalyzeNeed = async (text: string) => {
    setInputText(text);
    setIsExtracting(true);

    try {
      // Call backend API /api/extract-profile
      const res = await fetch("/api/extract-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`Extraction failed: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
        setShowProfileReview(true);
      }
    } catch (err) {
      console.warn("Backend API extraction error, employing client-side fallback:", err);
      // Quick fallback profile
      setUserProfile({
        stated_need: text,
        facts: [],
        inferred_categories: ["General Welfare"],
        missing_high_value_fields: ["state", "age", "annual_household_income"],
      });
      setShowProfileReview(true);
    } finally {
      setIsExtracting(false);
      // Scroll to results smoothly
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  // Base profile if user hasn't typed anything yet (shows full catalog)
  const effectiveProfile: UserProfile = useMemo(() => {
    if (userProfile) return userProfile;
    return {
      stated_need: "",
      facts: [],
      inferred_categories: [],
      missing_high_value_fields: ["state", "annual_household_income", "age"],
    };
  }, [userProfile]);

  // Execute Search & Candidate Generation Engine
  const candidateSchemes: CandidateScheme[] = useMemo(() => {
    return SearchService.searchSchemes(effectiveProfile, filters, database);
  }, [effectiveProfile, filters, database]);

  // Trigger AI scheme analysis whenever user requirement changes and candidate schemes are available
  useEffect(() => {
    if (!userProfile || !inputText.trim() || candidateSchemes.length === 0) {
      setAiAnalysis(null);
      return;
    }

    let cancelled = false;

    const topPool = candidateSchemes.slice(0, 10).map((c) => ({
      id: c.scheme.id,
      name: c.scheme.name,
      provider: c.scheme.provider,
      government_level: c.scheme.government_level,
      categories: c.scheme.categories,
      benefits: c.scheme.benefits,
      description: c.scheme.description,
      states: c.scheme.states,
    }));

    fetch("/api/ai-analyze-schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userQuery: inputText,
        userProfile,
        schemes: topPool,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AiSchemeAnalysisResult) => {
        if (!cancelled && data) {
          setAiAnalysis(data);
        }
      })
      .catch((err) => {
        console.warn("Async AI scheme analysis notice:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [userProfile, inputText, candidateSchemes]);

  // Determine top popped-up scheme required for user
  const poppedUpScheme = useMemo(() => {
    if (!userProfile && !inputText.trim()) return null;
    if (candidateSchemes.length === 0) return null;

    if (aiAnalysis?.topSchemeId) {
      const match = database.find((s) => s.id === aiAnalysis.topSchemeId);
      if (match && match.id !== dismissedTopSchemeId) return match;
    }

    const top = candidateSchemes[0]?.scheme;
    if (top && top.id !== dismissedTopSchemeId) return top;
    return null;
  }, [userProfile, inputText, candidateSchemes, aiAnalysis, database, dismissedTopSchemeId]);

  // Adaptive Questions based on candidate schemes
  const adaptiveQuestions = useMemo(() => {
    if (!userProfile) return [];
    return SearchService.getAdaptiveQuestions(effectiveProfile, candidateSchemes);
  }, [effectiveProfile, candidateSchemes, userProfile]);

  // Handlers for Adaptive Questions
  const handleAnswerQuestion = (field: string, value: any, sourceText: string) => {
    if (!userProfile) return;
    const existing = userProfile.facts.filter((f) => f.field !== field);
    setUserProfile({
      ...userProfile,
      facts: [
        ...existing,
        {
          field,
          value,
          confidence: 1.0,
          source: sourceText,
        },
      ],
    });
  };

  const handleDismissQuestion = (field: string) => {
    // Record as unknown/passed so it won't prompt repeatedly
    if (!userProfile) return;
    const existing = userProfile.facts.filter((f) => f.field !== field);
    setUserProfile({
      ...userProfile,
      facts: [
        ...existing,
        {
          field,
          value: null,
          confidence: 0,
          source: "User preferred not to answer or does not know",
        },
      ],
    });
  };

  // Comparison toggle
  const handleToggleCompare = (candidate: CandidateScheme) => {
    setComparedSchemeIds((prev) => {
      if (prev.includes(candidate.scheme.id)) {
        return prev.filter((id) => id !== candidate.scheme.id);
      }
      if (prev.length >= 4) {
        alert("You can compare a maximum of 4 schemes simultaneously.");
        return prev;
      }
      return [...prev, candidate.scheme.id];
    });
  };

  const schemesForComparison = useMemo(() => {
    return candidateSchemes.filter((c) => comparedSchemeIds.includes(c.scheme.id));
  }, [candidateSchemes, comparedSchemeIds]);

  // Reset to initial clean state
  const handleReset = () => {
    setUserProfile(null);
    setInputText("");
    setFilters({
      category: "ALL",
      state: "ALL",
      provider_type: "ALL",
      match_state: "ALL",
      search_query: "",
    });
    setComparedSchemeIds([]);
    setShowProfileReview(false);
    setAiAnalysis(null);
    setDismissedTopSchemeId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Admin Authentication handlers
  const handleOpenDatabaseManager = () => {
    if (AdminAuthService.isAuthenticated()) {
      setIsAdminAuthenticated(true);
      setIsDatabaseModalOpen(true);
    } else {
      setIsAdminPasswordModalOpen(true);
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setIsAdminPasswordModalOpen(false);
    setIsDatabaseModalOpen(true);
  };

  const handleAdminLogout = () => {
    AdminAuthService.logout();
    setIsAdminAuthenticated(false);
    setIsDatabaseModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Universal Top Navigation Header */}
      <Header
        schemes={database}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenDatabaseManager={handleOpenDatabaseManager}
        onReset={handleReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Erased Database Notice if 0 schemes */}
        {database.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <strong className="block font-bold text-stone-900 text-sm">
                  The website scheme database is currently empty (0 schemes).
                </strong>
                <span className="text-stone-600">
                  The whole database was erased by the administrator. Authorized admins can upload
                  or add new schemes, or restore defaults.
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenDatabaseManager}
              className="px-4 py-2 bg-stone-900 text-stone-50 font-semibold rounded-xl hover:bg-stone-800 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Open Database Console
            </button>
          </div>
        )}

        {/* Landing Hero Section */}
        <Hero
          categories={representedCategories}
          selectedCategory={filters.category || "ALL"}
          onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
          onFocusInput={() => inputRef.current?.focus()}
          onExploreCategories={() => {
            setFilters((prev) => ({ ...prev, category: "ALL" }));
            resultsRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Natural Language Input Container */}
        <NaturalLanguageInput
          ref={inputRef}
          onSubmit={handleAnalyzeNeed}
          isLoading={isExtracting}
          initialValue={inputText}
        />

        {/* Profile Review Drawer (Visible when user has analyzed query) */}
        {userProfile && showProfileReview && (
          <div className="max-w-3xl mx-auto">
            <ProfileReview
              profile={userProfile}
              onUpdateProfile={setUserProfile}
              onClose={() => setShowProfileReview(false)}
            />
          </div>
        )}

        {/* Adaptive Clarification Interview */}
        {userProfile && adaptiveQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <AdaptiveInterview
              questions={adaptiveQuestions}
              profile={userProfile}
              onAnswerQuestion={handleAnswerQuestion}
              onDismissQuestion={handleDismissQuestion}
            />
          </div>
        )}

        {/* Scheme Discovery Results Section */}
        <div ref={resultsRef} className="pt-6 border-t border-stone-200/80">
          {/* Results Summary and Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                We found {candidateSchemes.length} relevant opportunit
                {candidateSchemes.length === 1 ? "y" : "ies"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <span>Database Source of Truth</span>
                <span>·</span>
                <span>Guidance Mode Active</span>
                {userProfile?.stated_need && (
                  <>
                    <span>·</span>
                    <button
                      onClick={() => setShowProfileReview(!showProfileReview)}
                      className="text-stone-700 font-medium hover:underline cursor-pointer"
                    >
                      {showProfileReview ? "Hide Extracted Profile" : "Review Extracted Profile"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Filter Segmented Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category selector */}
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-700 hover:border-stone-400 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {representedCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* State filter */}
              <select
                value={filters.state}
                onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value }))}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-700 hover:border-stone-400 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All States / Central</option>
                {representedStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Match State filter */}
              <select
                value={filters.match_state}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    match_state: e.target.value as OverallMatchState | "ALL",
                  }))
                }
                className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 rounded-xl text-stone-700 hover:border-stone-400 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Guidance States</option>
                <option value="LIKELY MATCH">Likely Match</option>
                <option value="POTENTIAL MATCH">Potential Match</option>
                <option value="MORE INFORMATION NEEDED">More Information Needed</option>
                <option value="DOES NOT APPEAR TO MATCH">Does Not Appear to Match</option>
              </select>

              {/* Reset filter button if modified */}
              {(filters.category !== "ALL" ||
                filters.state !== "ALL" ||
                filters.match_state !== "ALL" ||
                filters.search_query) && (
                <button
                  onClick={() =>
                    setFilters({
                      category: "ALL",
                      state: "ALL",
                      provider_type: "ALL",
                      match_state: "ALL",
                      search_query: "",
                    })
                  }
                  className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {candidateSchemes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center max-w-xl mx-auto my-8">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-900">
                No matching schemes found in active database
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                No scheme matches the combination of your current filters and profile facts. Try
                clearing filters or reviewing extracted profile facts.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    category: "ALL",
                    state: "ALL",
                    provider_type: "ALL",
                    match_state: "ALL",
                    search_query: "",
                  })
                }
                className="mt-4 px-4 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Popped-Up Scheme (Prominently displayed with Concise Info First) */}
              {poppedUpScheme && (
                <AiPoppedUpSchemeBanner
                  scheme={poppedUpScheme}
                  popReason={aiAnalysis?.popReason}
                  conciseInfo={aiAnalysis?.conciseSchemes?.[poppedUpScheme.id]}
                  onViewDetailed={(scheme) => {
                    setSelectedAiScheme(scheme);
                    setIsAiGuidanceModalOpen(true);
                  }}
                  onDismiss={() => setDismissedTopSchemeId(poppedUpScheme.id)}
                />
              )}

              {/* All Candidate Schemes Grid with Concise Info First */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {candidateSchemes.map((candidate) => (
                  <SchemeCard
                    key={candidate.scheme.id}
                    candidate={candidate}
                    conciseInfo={aiAnalysis?.conciseSchemes?.[candidate.scheme.id]}
                    onOpenEvidence={(c) => setActiveEvidenceScheme(c)}
                    onOpenAiGuidance={(scheme) => {
                      setSelectedAiScheme(scheme);
                      setIsAiGuidanceModalOpen(true);
                    }}
                    onRefineResult={(c) => {
                      // Open profile review to clarify unknown criteria
                      setShowProfileReview(true);
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    isSelectedForCompare={comparedSchemeIds.includes(candidate.scheme.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Comparison Drawer Bar */}
      {comparedSchemeIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 max-w-xl mx-auto px-4 animate-in slide-in-from-bottom duration-200">
          <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-stone-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-semibold block">
                  {comparedSchemeIds.length} Scheme{comparedSchemeIds.length > 1 ? "s" : ""}{" "}
                  Selected
                </span>
                <span className="text-[11px] text-stone-400">
                  Compare criteria, benefits, documents &amp; process
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setComparedSchemeIds([])}
                className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 bg-white text-stone-950 font-semibold text-xs rounded-xl hover:bg-stone-100 transition-colors shadow-xs cursor-pointer"
              >
                Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Official Disclaimer & Footer */}
      <footer className="mt-16 border-t border-stone-200/80 bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1 max-w-2xl">
            <p className="font-semibold text-stone-800">Guidance &amp; Authority Notice:</p>
            <p className="leading-relaxed text-[11px] text-stone-500">
              SchemeSaar provides eligibility guidance strictly based on the available scheme
              database records and the information provided by the user. SchemeSaar is an
              independent discovery platform and does not represent the scheme authority. Final
              eligibility, sanction, and disbursement are subject to formal verification and
              approval by the respective government department or scheme provider.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-[11px] text-stone-400">
            <span>Universal AI Scheme Discovery Platform</span>
            <span>Zero-Hallucination · Database-First Architecture</span>
          </div>
        </div>
      </footer>

      {/* Traceability & Evidence Drawer */}
      <EvidenceDrawer
        candidate={activeEvidenceScheme}
        onClose={() => setActiveEvidenceScheme(null)}
      />

      {/* Scheme Comparison Modal */}
      {isCompareModalOpen && (
        <SchemeComparisonModal
          schemes={schemesForComparison}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveScheme={(id) => setComparedSchemeIds((prev) => prev.filter((i) => i !== id))}
        />
      )}

      {/* Admin Password Gate Modal */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onAuthenticated={handleAdminAuthenticated}
      />

      {/* Database Management & Uploader Modal (Admin Protected) */}
      {isDatabaseModalOpen && (
        <DatabaseManagerModal
          schemes={database}
          onDatabaseUpdated={(newSchemes) => setDatabase(newSchemes)}
          onClose={() => setIsDatabaseModalOpen(false)}
          onLogout={handleAdminLogout}
        />
      )}

      {/* AI Scheme Conscious Guidance & Chat Modal */}
      {isAiGuidanceModalOpen && (
        <AiSchemeGuidanceModal
          scheme={selectedAiScheme}
          userProfile={userProfile}
          userQuery={inputText}
          isOpen={isAiGuidanceModalOpen}
          onClose={() => {
            setIsAiGuidanceModalOpen(false);
            setSelectedAiScheme(null);
          }}
        />
      )}
    </div>
  );
}
