import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Calendar, User, Eye, Tag, Share2, Sparkles, BookOpen } from 'lucide-react';

export const ArticleModal = ({ article, isOpen, onClose }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {article.tags && article.tags.map((t) => (
                <span key={t} className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  #{t}
                </span>
              ))}
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 ml-2">
                <Calendar className="w-3.5 h-3.5" />
                {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {article.viewCount || 0} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Written by <span className="text-cyan-300 font-bold">@{article.authorUsername || 'dev'}</span></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Markdown Article */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto markdown-preview">
          
          {/* Executive Summary if available */}
          {article.summary && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 mb-6 text-sm text-cyan-200">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Summary
              </span>
              {article.summary}
            </div>
          )}

          <ReactMarkdown>{article.contentMarkdown}</ReactMarkdown>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>DevStream Content Engine (MongoDB Atlas)</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Article link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Article
          </button>
        </div>

      </div>
    </div>
  );
};
