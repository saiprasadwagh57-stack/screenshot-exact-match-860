import React, { useState, useRef } from 'react';
import { SchemeRecord } from '../types/scheme';
import { SchemeDataAdapter } from '../services/schemeDataAdapter';
import {
  X,
  Upload,
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Code2,
  HardDrive,
} from 'lucide-react';

interface DatabaseManagerModalProps {
  schemes: SchemeRecord[];
  onDatabaseUpdated: (newSchemes: SchemeRecord[]) => void;
  onClose: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  schemes,
  onDatabaseUpdated,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'inspect' | 'upload' | 'schema'>('inspect');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecord | null>(schemes[0] || null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalSchemes = schemes.length;
  const categoriesCount = Array.from(new Set(schemes.flatMap((s) => s.categories))).length;
  const centralCount = schemes.filter((s) => s.provider_type === 'central').length;
  const stateCount = schemes.filter((s) => s.provider_type === 'state').length;

  const filteredSchemes = schemes.filter((s) =>
    (s.name + ' ' + s.provider + ' ' + s.categories.join(' ')).toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus('Reading and parsing file(s)...');

    let allParsed: SchemeRecord[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = SchemeDataAdapter.parseDatabaseFile(content, file.name);
          allParsed = [...allParsed, ...parsed];
        } catch (err: any) {
          console.error('Error parsing file:', file.name, err);
        } finally {
          filesProcessed++;
          if (filesProcessed === files.length) {
            if (allParsed.length > 0) {
              SchemeDataAdapter.saveCustomSchemes(allParsed);
              onDatabaseUpdated(allParsed);
              setUploadStatus(`Successfully imported ${allParsed.length} schemes from ${files.length} file(s)!`);
              setSelectedScheme(allParsed[0] ?? null);
            } else {
              setUploadStatus('Could not extract valid scheme records. Please verify the JSON, CSV, or SQL structure.');
            }
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const handleResetToDefault = () => {
    SchemeDataAdapter.resetToDefault();
    const defaults = SchemeDataAdapter.getSchemes();
    onDatabaseUpdated(defaults);
    setSelectedScheme(defaults[0] || null);
    setUploadStatus('Reset to default authentic Central & State scheme database.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-900 text-stone-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Scheme Database Intelligence &amp; Data Adapter
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Inspect active scheme records, map real schema columns, or upload JSON/CSV/SQL database files.
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

        {/* Navigation Tabs & Overview Metrics */}
        <div className="px-5 py-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'inspect'
                  ? 'bg-stone-900 text-stone-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Browse Records ({totalSchemes})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-stone-900 text-stone-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Upload / Replace Database
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-stone-900 text-stone-50 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Normalized Model Schema
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{categoriesCount} Categories</span>
            <span>·</span>
            <span>{centralCount} Central</span>
            <span>·</span>
            <span>{stateCount} State</span>
            <button
              onClick={handleResetToDefault}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
              title="Reset to authentic default schemes"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Inspect Records */}
        {activeTab === 'inspect' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
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
                        ? 'bg-stone-900 text-stone-50 font-medium'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold truncate">{s.name}</div>
                    <div
                      className={`text-[11px] mt-0.5 truncate ${
                        selectedScheme?.id === s.id ? 'text-stone-300' : 'text-stone-400'
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
                      <p className="text-xs text-stone-500 mt-0.5">
                        {selectedScheme.provider}
                      </p>
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
                          {selectedScheme.age_rules?.min_age || selectedScheme.age_rules?.max_age
                            ? `${selectedScheme.age_rules?.min_age || 0} to ${selectedScheme.age_rules?.max_age || 'Unlimited'} years`
                            : 'No age constraints'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Annual Income Ceiling:</span>
                        <span className="text-stone-700">
                          {selectedScheme.income_rules?.max_annual_income
                            ? `₹${selectedScheme.income_rules.max_annual_income.toLocaleString('en-IN')}`
                            : 'None or Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">States / Coverage:</span>
                        <span className="text-stone-700">{selectedScheme.states.join(', ')}</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                      <span className="font-semibold text-stone-800 block">
                        Benefits &amp; Documents
                      </span>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Documented Benefit:</span>
                        <span className="text-stone-700 font-medium">
                          {selectedScheme.benefits[0]?.amount_or_details}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] block">Required Documents ({selectedScheme.documents.length}):</span>
                        <span className="text-stone-700">
                          {selectedScheme.documents.map((d) => d.name).join(', ')}
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
                  Select a scheme from the left to inspect its normalized fields and source record.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload / Replace Database */}
        {activeTab === 'upload' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                Upload Scheme Database Files
              </h3>
              <p className="text-xs text-stone-500 max-w-xl mx-auto">
                Upload your 3 database files (JSON, CSV, or SQL/Supabase export). The SchemeSaar data adapter automatically detects column mappings, extracts criteria, and preserves every raw record for evidence tracing.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/70 hover:bg-stone-100/70 p-10 rounded-2xl text-center cursor-pointer transition-colors"
            >
              <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <div className="text-sm font-semibold text-stone-800">
                Click to browse files or drop them here
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Supports .json, .csv, .tsv, and .sql dump files (Multiple files supported)
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

            {uploadStatus && (
              <div className="p-3.5 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 text-xs space-y-2 text-stone-600">
              <div className="font-semibold text-stone-800">Supported Ingestion Formats:</div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li><span className="font-mono text-stone-800">JSON</span>: Array of objects, or wrapped under keys like <code>schemes</code>, <code>data</code>, <code>records</code>.</li>
                <li><span className="font-mono text-stone-800">CSV / TSV</span>: Dynamic header matching for scheme name, ministry, age, income limits, benefits, documents, and links.</li>
                <li><span className="font-mono text-stone-800">SQL</span>: SQL dumps containing <code>INSERT INTO</code> statements.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Normalized Schema Documentation */}
        {activeTab === 'schema' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto space-y-6 text-xs text-stone-700">
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight mb-1">
                SchemeSaar Normalized Scheme Model Specification
              </h3>
              <p className="text-stone-500">
                Internal canonical representation supporting heterogeneous government database schemas without data loss.
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
                    <td className="p-3 text-stone-500">{'{ min_age, max_age }'}</td>
                    <td className="p-3">Age bracket reasoning</td>
                    <td className="p-3 text-emerald-700">null (UNKNOWN)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">income_rules</td>
                    <td className="p-3 text-stone-500">{'{ max_annual_income }'}</td>
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
                  <tr>
                    <td className="p-3 font-mono font-medium text-stone-900">raw_record</td>
                    <td className="p-3 text-stone-500">Record&lt;string, any&gt;</td>
                    <td className="p-3 font-semibold text-stone-900">Original raw record for zero-hallucination audit</td>
                    <td className="p-3 text-stone-600">Exact source file record</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Active Dataset: <span className="font-semibold text-stone-800">{totalSchemes} Schemes</span>
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
