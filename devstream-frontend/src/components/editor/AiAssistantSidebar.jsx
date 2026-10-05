import React from 'react';
import { Sparkles, Clock, Tag as TagIcon, FileText, Cpu, Loader2 } from 'lucide-react';

export const AiAssistantSidebar = ({
  wordCount,
  estimatedReadTime,
  aiLoading,
  aiMsg,
  onAutoTag,
  onSummarize,
  onCodeReview,
}) => {
  return (
    <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 bg-slate-950/90 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <span>AI Companion</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                FastAPI
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400">LangChain Co-Pilot</p>
          </div>
        </div>
      </div>

      {/* Metrics Badges */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500">Read Time</div>
            <div className="font-bold text-slate-200">{estimatedReadTime} min ({wordCount} words)</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500">Engine</div>
            <div className="font-bold text-slate-200">Port 8000 AI</div>
          </div>
        </div>
      </div>

      {/* AI Trigger Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={onAutoTag}
          disabled={aiLoading}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <span className="flex items-center gap-2">
            <TagIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Detect Domain Tags</span>
          </span>
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Sparkles className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onSummarize}
          disabled={aiLoading}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate 2-Sentence Abstract</span>
          </span>
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Sparkles className="w-3.5 h-3.5" />}
        </button>

        {onCodeReview && (
          <button
            type="button"
            onClick={onCodeReview}
            disabled={aiLoading}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-500/40 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Code Audit</span>
            </span>
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {aiLoading && aiMsg && (
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center gap-2 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{aiMsg}</span>
        </div>
      )}
    </div>
  );
};
