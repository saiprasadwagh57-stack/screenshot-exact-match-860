import React, { useState } from 'react';
import { UserProfile, ProfileFact } from '../types/scheme';
import { Edit3, Check, X, Plus, ShieldCheck, Trash2 } from 'lucide-react';

interface ProfileReviewProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const ProfileReview: React.FC<ProfileReviewProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState('state');
  const [newValue, setNewValue] = useState('');

  const formatFieldName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(String(profile.facts[index]?.value ?? ''));
  };

  const handleSaveEdit = (index: number) => {
    const updatedFacts = [...profile.facts];
    let val: any = editValue;
    const existing = updatedFacts[index];
    if (!existing) return;
    if (existing.field === 'age' || existing.field === 'annual_household_income') {
      const num = Number(editValue);
      if (!isNaN(num)) val = num;
    }
    updatedFacts[index] = {
      ...existing,
      value: val,
      confidence: 1.0,
      source: 'User confirmed / edited manually',
    };

    onUpdateProfile({
      ...profile,
      facts: updatedFacts,
    });
    setEditingIndex(null);
  };

  const handleDeleteFact = (index: number) => {
    const updatedFacts = profile.facts.filter((_, idx) => idx !== index);
    onUpdateProfile({
      ...profile,
      facts: updatedFacts,
    });
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    let val: any = newValue.trim();
    if (newField === 'age' || newField === 'annual_household_income') {
      const num = Number(val);
      if (!isNaN(num)) val = num;
    }

    const newFact: ProfileFact = {
      field: newField,
      value: val,
      confidence: 1.0,
      source: 'Manually added by user',
    };

    // Remove old fact with same field name if already exists
    const filtered = profile.facts.filter((f) => f.field !== newField);
    onUpdateProfile({
      ...profile,
      facts: [...filtered, newFact],
    });

    setNewValue('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
              Review Extracted Facts
            </h3>
            <span className="text-[11px] text-stone-500 font-normal">
              · Transparent Profile Verification
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            These facts were extracted from your statement to search schemes. You can edit, delete, or add accurate details.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Facts Table / List */}
      <div className="mt-4 divide-y divide-stone-100">
        {profile.facts.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-400">
            No specific facts detected yet. Add details like age, state, or income to refine matching.
          </div>
        ) : (
          profile.facts.map((fact, index) => (
            <div
              key={index}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800">
                    {formatFieldName(fact.field)}
                  </span>
                  <span className="text-stone-400 text-[10px]">
                    · {Math.round(fact.confidence * 100)}% confidence
                  </span>
                </div>

                {editingIndex === index ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500 bg-stone-50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="p-1 bg-stone-900 text-stone-50 rounded hover:bg-stone-800 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="p-1 text-stone-500 hover:text-stone-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5 text-stone-600 truncate">
                    <span className="font-semibold text-stone-900">
                      {fact.field === 'annual_household_income'
                        ? `₹${Number(fact.value).toLocaleString('en-IN')}`
                        : String(fact.value)}
                    </span>
                    <span className="text-[11px] text-stone-400 truncate">
                      (source: &ldquo;{fact.source}&rdquo;)
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {editingIndex !== index && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                    title="Edit fact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFact(index)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Remove fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Fact Toggle / Form */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add missing detail (e.g. State, Income, Age, Category)</span>
          </button>
        ) : (
          <form onSubmit={handleAddFact} className="w-full flex flex-wrap items-center gap-2 text-xs">
            <select
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              className="px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50 text-stone-800"
            >
              <option value="state">State / Region</option>
              <option value="annual_household_income">Annual Family Income</option>
              <option value="age">Age</option>
              <option value="occupation">Occupation</option>
              <option value="social_category">Social Category (SC/ST/OBC/General)</option>
              <option value="gender">Gender</option>
              <option value="education_level">Education Level</option>
            </select>

            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value (e.g., Karnataka, 250000, 21)"
              className="px-2.5 py-1.5 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 flex-1 min-w-[140px]"
            />

            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 text-stone-50 rounded-lg font-medium hover:bg-stone-800 cursor-pointer"
            >
              Save Fact
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2 py-1.5 text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
