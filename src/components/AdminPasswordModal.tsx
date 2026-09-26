import React, { useState } from "react";
import { Lock, Eye, EyeOff, X, ShieldAlert, KeyRound, Check } from "lucide-react";
import { AdminAuthService } from "../services/adminAuthService";

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the admin password.");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await AdminAuthService.verifyPasswordAsync(password);
      if (isValid) {
        AdminAuthService.setSessionAuthenticated(true);
        setError(null);
        setPassword("");
        onAuthenticated();
      } else {
        setError("Incorrect password. Please verify and try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUseDefault = () => {
    const current = AdminAuthService.getAdminPassword();
    setPassword(current);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                Admin Authentication Required
              </h2>
              <p className="text-[11px] text-stone-500">Scheme Database Management Console</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              setPassword("");
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-stone-600 leading-relaxed">
            The database management option is restricted to authorized administrators. Enter the
            configured admin password to inspect, erase, or upload new scheme records.
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
                placeholder="Enter password..."
                className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Prepared default password hint */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Default Password Prepared:</span>
              </div>
              <div className="text-[11px] text-amber-800">
                Initial password is set to{" "}
                <code className="font-mono font-bold bg-amber-100/80 px-1 py-0.5 rounded text-amber-900">
                  {AdminAuthService.DEFAULT_PASSWORD}
                </code>
                . (You can change this inside the database settings).
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDefault}
              className="shrink-0 text-[11px] font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer pt-0.5"
            >
              Fill
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPassword("");
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enter Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
