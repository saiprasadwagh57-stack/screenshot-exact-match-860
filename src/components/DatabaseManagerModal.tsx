import React, { useState, useRef } from "react";
import { SchemeRecord, GovernmentLevel, ProviderType } from "../types/scheme";
import { SchemeDataAdapter } from "../services/schemeDataAdapter";
import { AdminAuthService } from "../services/adminAuthService";
import {
  X,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Code2,
  Trash2,
  KeyRound,
  ShieldCheck,
  LogOut,
  FileCode,
  PlusCircle,
  Layers,
  AlertTriangle,
  Download,
} from "lucide-react";

interface DatabaseManagerModalProps {
  schemes: SchemeRecord[];
  onDatabaseUpdated: (newSchemes: SchemeRecord[]) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  schemes,
  onDatabaseUpdated,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    "inspect" | "add_database" | "erase_database" | "admin_security" | "schema"
  >("inspect");
  const [addMode, setAddMode] = useState<"file_upload" | "paste_data" | "single_scheme">(
    "file_upload",
  );
  const [importAction, setImportAction] = useState<"replace" | "append">("replace");

  const [searchFilter, setSearchFilter] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecord | null>(schemes[0] || null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Paste Data state
  const [pastedContent, setPastedContent] = useState("");
  const [pastedFormat, setPastedFormat] = useState<"json" | "csv">("json");

  // Single Scheme Form State
  const [newSchemeForm, setNewSchemeForm] = useState({
    name: "",
    provider: "",
    government_level: "Central" as GovernmentLevel,
    provider_type: "central" as ProviderType,
    categories: "Education & Scholarships",
    states: "All-India",
    min_age: "",
    max_age: "",
    max_income: "",
    benefit_details: "",
    documents: "Aadhaar Card, Bank Account Details",
    source_url: "",
  });

  // Password Management State
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Erase confirmation dialog state
  const [showEraseConfirmDialog, setShowEraseConfirmDialog] = useState(false);
  const [eraseConfirmText, setEraseConfirmText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalSchemes = schemes.length;
  const categoriesCount = Array.from(new Set(schemes.flatMap((s) => s.categories))).length;
  const centralCount = schemes.filter((s) => s.provider_type === "central").length;
  const stateCount = schemes.filter((s) => s.provider_type === "state").length;

  const filteredSchemes = schemes.filter((s) =>
    (s.name + " " + s.provider + " " + s.categories.join(" "))
      .toLowerCase()
      .includes(searchFilter.toLowerCase()),
  );

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setStatusMessage({ type: "info", text: "Reading and parsing file(s)..." });

    let allParsed: SchemeRecord[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = SchemeDataAdapter.parseDatabaseFile(content, file.name);
          allParsed = [...allParsed, ...parsed];
        } catch (err: unknown) {
          console.error("Error parsing file:", file.name, err);
        } finally {
          filesProcessed++;
          if (filesProcessed === files.length) {
            if (allParsed.length > 0) {
              const res = await SchemeDataAdapter.saveSchemesToServer(allParsed, importAction);
              const updated = SchemeDataAdapter.getSchemes();
              onDatabaseUpdated(updated);
              setStatusMessage({
                type: "success",
                text: `Successfully ${importAction === "replace" ? "replaced database with" : "appended"} ${allParsed.length} schemes across all devices! Total active schemes: ${updated.length}.`,
              });
              setSelectedScheme(updated[0] ?? null);
            } else {
              setStatusMessage({
                type: "error",
                text: "Could not extract valid scheme records. Please verify the JSON, CSV, or SQL structure.",
              });
            }
          }
        }
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Paste Data Handler
  const handleImportPastedData = async () => {
    if (!pastedContent.trim()) {
      setStatusMessage({ type: "error", text: "Please paste your JSON or CSV content first." });
      return;
    }

    try {
      const filename = pastedFormat === "json" ? "pasted_data.json" : "pasted_data.csv";
      const parsed = SchemeDataAdapter.parseDatabaseFile(pastedContent, filename);

      if (parsed.length === 0) {
        setStatusMessage({
          type: "error",
          text: "No valid schemes could be recognized in the pasted data. Check formatting.",
        });
        return;
      }

      await SchemeDataAdapter.saveSchemesToServer(parsed, importAction);
      const updated = SchemeDataAdapter.getSchemes();

      onDatabaseUpdated(updated);
      setSelectedScheme(updated[0] ?? null);
      setPastedContent("");
      setStatusMessage({
        type: "success",
        text: `Successfully ${importAction === "replace" ? "replaced database with" : "appended"} ${parsed.length} schemes across all devices! Total active schemes: ${updated.length}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatusMessage({ type: "error", text: `Failed to parse pasted data: ${msg}` });
    }
  };

  // Single Scheme Creation Handler
  const handleAddSingleScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeForm.name.trim() || !newSchemeForm.provider.trim()) {
      setStatusMessage({
        type: "error",
        text: "Scheme Name and Provider/Ministry are required.",
      });
      return;
    }

    const newScheme: SchemeRecord = {
      id: `CUSTOM-${Date.now().toString(36).toUpperCase()}`,
      name: newSchemeForm.name.trim(),
      description: newSchemeForm.benefit_details.trim() || newSchemeForm.name.trim(),
      provider: newSchemeForm.provider.trim(),
      provider_type: newSchemeForm.provider_type,
      government_level: newSchemeForm.government_level,
      categories: newSchemeForm.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      states: newSchemeForm.states
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      districts: [],
      beneficiary_groups: [],
      age_rules: {
        min_age: newSchemeForm.min_age ? parseInt(newSchemeForm.min_age, 10) : null,
        max_age: newSchemeForm.max_age ? parseInt(newSchemeForm.max_age, 10) : null,
        description:
          newSchemeForm.min_age || newSchemeForm.max_age
            ? `Age between ${newSchemeForm.min_age || 0} and ${newSchemeForm.max_age || "Unlimited"}`
            : null,
      },
      income_rules: {
        max_annual_income: newSchemeForm.max_income ? parseFloat(newSchemeForm.max_income) : null,
        min_annual_income: null,
        description: newSchemeForm.max_income
          ? `Annual income ceiling: ₹${parseInt(newSchemeForm.max_income, 10).toLocaleString("en-IN")}`
          : null,
      },
      occupation_rules: { allowed_occupations: [], description: null },
      education_rules: { min_education_level: null, eligible_courses: [], description: null },
      housing_rules: { required_housing_status: null, description: null },
      gender_rules: { allowed_genders: ["any"], description: null },
      social_category_rules: { allowed_categories: ["Any"], description: null },
      disability_rules: { requires_disability: false, min_percentage: null, description: null },
      benefits: [
        {
          type: "financial",
          amount_or_details: newSchemeForm.benefit_details || "Assistance as per guidelines",
          frequency: "one-time",
        },
      ],
      documents: newSchemeForm.documents
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
        .map((name) => ({ name, is_mandatory: true, alternative_acceptable: [] })),
      application_process: { mode: "Online / Offline", application_url: newSchemeForm.source_url },
      source_url: newSchemeForm.source_url.trim() || undefined,
      status: "Active",
      raw_record: {
        scheme_name: newSchemeForm.name,
        ministry: newSchemeForm.provider,
        benefits: newSchemeForm.benefit_details,
        official_link: newSchemeForm.source_url,
      },
    };

    await SchemeDataAdapter.saveSchemesToServer([newScheme], "append");
    const updated = SchemeDataAdapter.getSchemes();
    onDatabaseUpdated(updated);
    setSelectedScheme(newScheme);
    setNewSchemeForm({
      name: "",
      provider: "",
      government_level: "Central",
      provider_type: "central",
      categories: "Education & Scholarships",
      states: "All-India",
      min_age: "",
      max_age: "",
      max_income: "",
      benefit_details: "",
      documents: "Aadhaar Card, Bank Account Details",
      source_url: "",
    });
    setStatusMessage({
      type: "success",
      text: `Successfully added scheme "${newScheme.name}" across all devices! Total active schemes: ${updated.length}.`,
    });
  };

  // Erase whole database handler
  const handleExecuteEraseDatabase = async () => {
    await SchemeDataAdapter.clearAllSchemesServer();
    onDatabaseUpdated([]);
    setSelectedScheme(null);
    setShowEraseConfirmDialog(false);
    setEraseConfirmText("");
    setStatusMessage({
      type: "success",
      text: "The website database has been completely erased across all devices. Active schemes count is now 0.",
    });
  };

  // Reset to default authentic schemes
  const handleResetToDefault = async () => {
    const res = await SchemeDataAdapter.resetToDefaultServer();
    const defaults = res.schemes || SchemeDataAdapter.getSchemes();
    onDatabaseUpdated(defaults);
    setSelectedScheme(defaults[0] || null);
    setStatusMessage({
      type: "success",
      text: `Database restored across all devices to default authentic collection (${defaults.length} schemes).`,
    });
  };

  // Password change handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!AdminAuthService.verifyPassword(oldPasswordInput)) {
      setPasswordStatus({ type: "error", text: "Current password is incorrect." });
      return;
    }
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      setPasswordStatus({
        type: "error",
        text: "New password must be at least 4 characters long.",
      });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatus({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    const result = await AdminAuthService.updatePasswordAsync(oldPasswordInput, newPasswordInput);
    if (result.success) {
      setOldPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setPasswordStatus({
        type: "success",
        text: "Admin password successfully updated on server and across all devices!",
      });
    } else {
      setPasswordStatus({
        type: "error",
        text: result.error || "Failed to update password.",
      });
    }
  };

  // Export database as JSON
  const handleExportDatabase = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemes, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `schemesaar_database_${schemes.length}_schemes.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-stone-900 text-stone-100 shadow-xs">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Scheme Database Intelligence &amp; Data Adapter
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Admin Authorized
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Full administrative control: inspect, add new schemes, erase the database, or manage
                admin security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200/80 transition-colors cursor-pointer"
              title="Lock database and log out from admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => {
                setActiveTab("inspect");
                setStatusMessage(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "inspect"
                  ? "bg-stone-900 text-stone-50 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Browse Records ({totalSchemes})
            </button>
            <button
              onClick={() => {
                setActiveTab("add_database");
                setStatusMessage(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "add_database"
                  ? "bg-stone-900 text-stone-50 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Database</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("erase_database");
                setStatusMessage(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "erase_database"
                  ? "bg-red-700 text-white shadow-2xs"
                  : "text-red-700 hover:text-red-900 hover:bg-red-50"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase Database</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("admin_security");
                setStatusMessage(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "admin_security"
                  ? "bg-stone-900 text-stone-50 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Password</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("schema");
                setStatusMessage(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "schema"
                  ? "bg-stone-900 text-stone-50 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Schema Model
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            {schemes.length > 0 && (
              <button
                onClick={handleExportDatabase}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                title="Download entire current database as a JSON file"
              >
                <Download className="w-3 h-3" />
                <span>Export JSON</span>
              </button>
            )}
            <button
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
              title="Reset to authentic default schemes"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Global Status Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center gap-2 border-b ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : statusMessage.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: Browse Records */}
        {activeTab === "inspect" && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {totalSchemes === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50/50">
                <div className="w-16 h-16 rounded-2xl bg-stone-200/80 text-stone-500 flex items-center justify-center mb-4">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  The website database is currently empty
                </h3>
                <p className="text-xs text-stone-500 max-w-md mt-1 mb-5">
                  All scheme records have been erased. You can add a new database using JSON, CSV,
                  or SQL files, or restore default schemes at any time.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("add_database")}
                    className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Database</span>
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restore Default Schemes</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Sidebar record list */}
                <div className="w-full md:w-80 border-r border-stone-200 flex flex-col bg-stone-50/50">
                  <div className="p-3 border-b border-stone-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Filter records..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                    {filteredSchemes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedScheme(s)}
                        className={`p-3 text-xs cursor-pointer transition-colors ${
                          selectedScheme?.id === s.id
                            ? "bg-stone-900 text-stone-50 font-medium"
                            : "hover:bg-stone-100 text-stone-700"
                        }`}
                      >
                        <div className="font-semibold truncate">{s.name}</div>
                        <div
                          className={`text-[11px] mt-0.5 truncate ${
                            selectedScheme?.id === s.id ? "text-stone-300" : "text-stone-400"
                          }`}
                        >
                          {s.provider}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheme Detail & Raw Record View */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {selectedScheme ? (
                    <div>
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
                        <div>
                          <div className="text-[11px] font-mono text-stone-400 uppercase">
                            ID: {selectedScheme.id} · {selectedScheme.government_level} Level
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 tracking-tight mt-1">
                            {selectedScheme.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5">{selectedScheme.provider}</p>
                        </div>

                        {selectedScheme.source_url && (
                          <a
                            href={selectedScheme.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
                          >
                            <span>Official Link</span>
                          </a>
                        )}
                      </div>

                      {/* Normalized fields breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4">
                        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                          <span className="font-semibold text-stone-800 block">
                            Eligibility Rules (Normalized)
                          </span>
                          <div>
                            <span className="text-stone-400 text-[10px] block">Age:</span>
                            <span className="text-stone-700">
                              {selectedScheme.age_rules?.min_age ||
                              selectedScheme.age_rules?.max_age
                                ? `${selectedScheme.age_rules?.min_age || 0} to ${selectedScheme.age_rules?.max_age || "Unlimited"} years`
                                : "No age constraints"}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">
                              Annual Income Ceiling:
                            </span>
                            <span className="text-stone-700">
                              {selectedScheme.income_rules?.max_annual_income
                                ? `₹${selectedScheme.income_rules.max_annual_income.toLocaleString("en-IN")}`
                                : "None or Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">
                              States / Coverage:
                            </span>
                            <span className="text-stone-700">
                              {selectedScheme.states.join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                          <span className="font-semibold text-stone-800 block">
                            Benefits &amp; Documents
                          </span>
                          <div>
                            <span className="text-stone-400 text-[10px] block">
                              Documented Benefit:
                            </span>
                            <span className="text-stone-700 font-medium">
                              {selectedScheme.benefits[0]?.amount_or_details || "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px] block">
                              Required Documents ({selectedScheme.documents.length}):
                            </span>
                            <span className="text-stone-700">
                              {selectedScheme.documents.map((d) => d.name).join(", ") ||
                                "None specified"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Raw Record Section */}
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Code2 className="w-4 h-4 text-stone-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                            Preserved Raw Source Record
                          </span>
                        </div>
                        <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                          {JSON.stringify(selectedScheme.raw_record, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 text-center py-12">
                      Select a scheme from the left to inspect its normalized fields and source
                      record.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Add New Database */}
        {activeTab === "add_database" && (
          <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 tracking-tight">
                  Add New Schemes to Database
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Upload file(s), paste raw JSON/CSV, or manually create new scheme records.
                </p>
              </div>

              {/* Action type: Replace vs Append */}
              <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setImportAction("replace")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    importAction === "replace"
                      ? "bg-white text-stone-900 shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Replace All
                </button>
                <button
                  type="button"
                  onClick={() => setImportAction("append")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    importAction === "append"
                      ? "bg-white text-stone-900 shadow-2xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Append to Existing
                </button>
              </div>
            </div>

            {/* Ingestion Method Switcher */}
            <div className="grid grid-cols-3 gap-2 bg-stone-100/80 p-1.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddMode("file_upload")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addMode === "file_upload"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMode("paste_data")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addMode === "paste_data"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Paste JSON / CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMode("single_scheme")}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addMode === "single_scheme"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Single Scheme</span>
              </button>
            </div>

            {/* Mode 1: File Upload */}
            {addMode === "file_upload" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/70 hover:bg-stone-100/70 p-8 rounded-2xl text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-10 h-10 text-stone-400 mx-auto mb-2.5" />
                  <div className="text-sm font-semibold text-stone-800">
                    Click to browse files or drop them here
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports JSON, CSV, TSV, or SQL dump exports. (Multiple files supported)
                  </p>
                  <p className="text-[11px] font-medium text-amber-700 mt-2">
                    Action Mode:{" "}
                    {importAction === "replace"
                      ? "Will REPLACE all current schemes"
                      : "Will APPEND to current database"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".json,.csv,.tsv,.sql,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Paste Raw Data */}
            {addMode === "paste_data" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-stone-700">Format:</span>
                    <button
                      type="button"
                      onClick={() => setPastedFormat("json")}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium ${
                        pastedFormat === "json"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setPastedFormat("csv")}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium ${
                        pastedFormat === "csv"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Mode: <strong>{importAction === "replace" ? "Replace all" : "Append"}</strong>
                  </span>
                </div>

                <textarea
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder={
                    pastedFormat === "json"
                      ? '[\n  {\n    "id": "SCH-001",\n    "name": "Prime Minister Kisan Samman Nidhi",\n    "provider": "Ministry of Agriculture",\n    "categories": ["Agriculture & Rural"],\n    "benefits": "₹6,000 per year"\n  }\n]'
                      : 'scheme_name,ministry,category,benefits,min_age,max_age\n"PM-KISAN","Ministry of Agriculture","Agriculture","₹6000/yr",18,60'
                  }
                  rows={9}
                  className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportPastedData}
                    className="px-5 py-2.5 bg-stone-900 text-stone-50 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Parse &amp;{" "}
                      {importAction === "replace" ? "Replace Database" : "Append to Database"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Add Single Scheme Form */}
            {addMode === "single_scheme" && (
              <form onSubmit={handleAddSingleScheme} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Scheme Name *</label>
                    <input
                      type="text"
                      required
                      value={newSchemeForm.name}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, name: e.target.value })}
                      placeholder="e.g. National Merit Scholarship Scheme"
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Ministry / Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSchemeForm.provider}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, provider: e.target.value })
                      }
                      placeholder="e.g. Ministry of Education"
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Government Level
                    </label>
                    <select
                      value={newSchemeForm.government_level}
                      onChange={(e) =>
                        setNewSchemeForm({
                          ...newSchemeForm,
                          government_level: e.target.value as GovernmentLevel,
                          provider_type: e.target.value.toLowerCase() as ProviderType,
                        })
                      }
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    >
                      <option value="Central">Central Level</option>
                      <option value="State">State Level</option>
                      <option value="District">District / Local Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Category (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newSchemeForm.categories}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, categories: e.target.value })
                      }
                      placeholder="Education, Agriculture, Housing, etc."
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Age Range (Min &amp; Max)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min (e.g. 18)"
                        value={newSchemeForm.min_age}
                        onChange={(e) =>
                          setNewSchemeForm({ ...newSchemeForm, min_age: e.target.value })
                        }
                        className="w-1/2 p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                      <input
                        type="number"
                        placeholder="Max (e.g. 35)"
                        value={newSchemeForm.max_age}
                        onChange={(e) =>
                          setNewSchemeForm({ ...newSchemeForm, max_age: e.target.value })
                        }
                        className="w-1/2 p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Max Annual Income Limit (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 300000"
                      value={newSchemeForm.max_income}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, max_income: e.target.value })
                      }
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">
                      Benefit Details / Grant Amount
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹50,000 scholarship per year during full course duration"
                      value={newSchemeForm.benefit_details}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, benefit_details: e.target.value })
                      }
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">
                      Required Documents (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Aadhaar Card, Income Certificate, College Marksheet"
                      value={newSchemeForm.documents}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, documents: e.target.value })
                      }
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">
                      Official Portal URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://scholarships.gov.in"
                      value={newSchemeForm.source_url}
                      onChange={(e) =>
                        setNewSchemeForm({ ...newSchemeForm, source_url: e.target.value })
                      }
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 text-stone-50 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save &amp; Add Scheme</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Erase Database (Danger Zone) */}
        {activeTab === "erase_database" && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-red-100 text-red-700 rounded-xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-950">Erase Whole Website Database</h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    This administrative action will completely wipe all scheme records from this
                    website. The database will have 0 schemes and will display an empty database
                    state to visitors until a new database is uploaded.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white/80 border border-red-200 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between text-stone-700">
                  <span>Current Active Schemes:</span>
                  <span className="font-bold text-stone-900">{totalSchemes} schemes</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Categories Represented:</span>
                  <span className="font-bold text-stone-900">{categoriesCount} categories</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Status after erasure:</span>
                  <span className="font-bold text-red-600">0 schemes (Completely empty)</span>
                </div>
              </div>

              {!showEraseConfirmDialog ? (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEraseConfirmDialog(true)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Erase All Schemes (Wipe Database)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Default Schemes</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white border-2 border-red-400 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="text-xs font-semibold text-red-950">
                    Confirmation Required: Type &ldquo;ERASE&rdquo; below to confirm wiping the
                    whole database:
                  </div>
                  <input
                    type="text"
                    value={eraseConfirmText}
                    onChange={(e) => setEraseConfirmText(e.target.value)}
                    placeholder='Type "ERASE" to confirm'
                    className="w-full p-2.5 text-xs font-mono border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEraseConfirmDialog(false);
                        setEraseConfirmText("");
                      }}
                      className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={eraseConfirmText.trim().toUpperCase() !== "ERASE"}
                      onClick={handleExecuteEraseDatabase}
                      className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Yes, Wipe All Schemes Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-200/80 leading-relaxed">
              <strong>Note:</strong> After wiping the database, you can upload your custom scheme
              files in the <em>Add New Database</em> tab, or click <em>Reset Default Schemes</em> to
              re-populate the authentic 2,066-scheme national database at any time.
            </div>
          </div>
        )}

        {/* TAB 4: Admin Security & Password Management */}
        {activeTab === "admin_security" && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-xl mx-auto w-full space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                Admin Password Settings
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Set and maintain the administrative password required to access the scheme database.
              </p>
            </div>

            {passwordStatus && (
              <div
                className={`p-3.5 text-xs rounded-xl flex items-center gap-2 border ${
                  passwordStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {passwordStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{passwordStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Current Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  New Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new secure password..."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    AdminAuthService.resetPasswordToDefault();
                    setPasswordStatus({
                      type: "success",
                      text: `Password reset to default: "${AdminAuthService.DEFAULT_PASSWORD}".`,
                    });
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Reset to default ({AdminAuthService.DEFAULT_PASSWORD})
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 text-stone-50 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Admin Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: Schema Documentation */}
        {activeTab === "schema" && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 text-xs text-stone-700">
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight mb-1">
                SchemeSaar Normalized Scheme Model Specification
              </h3>
              <p className="text-stone-500">
                Internal canonical representation supporting heterogeneous government database
                schemas without data loss.
              </p>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Field</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Role in SchemeSaar</th>
                    <th className="p-3">Missing Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[11px]">
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">scheme_id / id</td>
                    <td className="p-3 text-stone-500">string</td>
                    <td className="p-3">Unique scheme identifier</td>
                    <td className="p-3 text-amber-700">Auto-generated hash</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">scheme_name / name</td>
                    <td className="p-3 text-stone-500">string</td>
                    <td className="p-3">Official title of scheme</td>
                    <td className="p-3 text-amber-700">Required</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">age_rules</td>
                    <td className="p-3 text-stone-500">{"{ min_age, max_age }"}</td>
                    <td className="p-3">Age bracket reasoning</td>
                    <td className="p-3 text-emerald-700">null (UNKNOWN)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">income_rules</td>
                    <td className="p-3 text-stone-500">{"{ max_annual_income }"}</td>
                    <td className="p-3">Household income limit check</td>
                    <td className="p-3 text-emerald-700">null (UNKNOWN)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">states</td>
                    <td className="p-3 text-stone-500">string[]</td>
                    <td className="p-3">Geographic state / UT restriction</td>
                    <td className="p-3 text-stone-600">[&quot;All-India&quot;]</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">benefits</td>
                    <td className="p-3 text-stone-500">BenefitItem[]</td>
                    <td className="p-3">Direct transfer, subsidy, or in-kind assistance</td>
                    <td className="p-3 text-stone-600">Preserved verbatim</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">documents</td>
                    <td className="p-3 text-stone-500">DocumentItem[]</td>
                    <td className="p-3">Checklist of mandatory &amp; optional proofs</td>
                    <td className="p-3 text-stone-600">Standard KYC default</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Active Dataset:{" "}
            <span className="font-semibold text-stone-800">{totalSchemes} Schemes</span>
            {totalSchemes === 0 && (
              <span className="ml-2 text-red-600 font-semibold">(Database Erased)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-stone-50 text-xs font-medium rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close Database Manager
          </button>
        </div>
      </div>
    </div>
  );
};
