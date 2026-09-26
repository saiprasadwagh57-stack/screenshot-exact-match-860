import React from "react";
import { Database, BookOpen, Lock, ShieldCheck } from "lucide-react";
import { SchemeRecord } from "../types/scheme";

interface HeaderProps {
  schemes: SchemeRecord[];
  isAdminAuthenticated: boolean;
  onOpenDatabaseManager: () => void;
  onOpenScenarios: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schemes,
  isAdminAuthenticated,
  onOpenDatabaseManager,
  onOpenScenarios,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/85 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div onClick={onReset} className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            <span>S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 tracking-tight text-base leading-tight group-hover:text-stone-700 transition-colors">
              SchemeSaar
            </span>
            <span className="text-[11px] text-stone-500 font-normal">
              Universal Scheme Guidance
            </span>
          </div>
        </div>

        {/* Center / Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Test Scenarios */}
          <button
            onClick={onOpenScenarios}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            title="Load 10 realistic test scenarios across education, agriculture, housing, business, etc."
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">10 Test Scenarios</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Database Inspector & Uploader (Admin Protected) */}
          <button
            onClick={onOpenDatabaseManager}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isAdminAuthenticated
                ? "text-stone-900 bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/80"
                : "text-stone-700 hover:text-stone-950 bg-stone-100/90 hover:bg-stone-200/80 border-stone-200/80"
            }`}
            title={
              isAdminAuthenticated
                ? "Admin authenticated: Click to manage, erase, or add schemes"
                : "Admin access only: Click to unlock database with admin password"
            }
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-stone-500" />
            )}
            <Database className="w-3.5 h-3.5 text-stone-700" />
            <span>Database</span>
            <span className="text-stone-400 text-[10px]">({schemes.length})</span>
            {isAdminAuthenticated && (
              <span className="hidden sm:inline text-[9px] bg-emerald-200/70 text-emerald-800 font-semibold px-1 rounded">
                Admin
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
