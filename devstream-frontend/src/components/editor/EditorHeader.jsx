import React from 'react';
import { Save, Send, Clock, Sparkles } from 'lucide-react';

export const EditorHeader = ({
  initialDraft,
  saving,
  lastSavedAgo,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            GFG-STYLE WYSIWYG
          </span>
          {lastSavedAgo && (
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800 text-emerald-400">
              <Clock className="w-3 h-3 text-emerald-400" />
              Draft saved locally {lastSavedAgo}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {initialDraft ? 'Edit Technical Article' : 'Compose Technical Article'}
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>Save Draft (Ctrl+S)</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
        >
          <Send className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Publish Article (Ctrl+Enter)'}</span>
        </button>
      </div>
    </div>
  );
};
