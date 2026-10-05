import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import { articleService, moderationService } from '../services/api';
import { X, Calendar, User, Eye, EyeOff, Tag, Share2, Sparkles, BookOpen, Trash2, ShieldCheck } from 'lucide-react';

export const ArticleModal = ({ article, isOpen, onClose, onDeleteSuccess, onStatusChange }) => {
  const { currentUser, isModerator, isStudent } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(article?.status || 'PUBLISHED');

  useEffect(() => {
    if (article) {
      setCurrentStatus(article.status || 'PUBLISHED');
    }
  }, [article]);

  if (!isOpen || !article) return null;

  const canDelete = isModerator || (isStudent && currentUser?.username === article.authorUsername);
  const isHidden = currentStatus === 'HIDDEN';

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) return;
    try {
      await articleService.deleteArticle(article.slug);
      onClose();
      if (onDeleteSuccess) onDeleteSuccess(article.slug);
    } catch (err) {
      alert('Failed to delete article: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleVisibility = async () => {
    const shouldHide = !isHidden;
    try {
      await moderationService.setArticleVisibility(article.slug, shouldHide);
      const newStatus = shouldHide ? 'HIDDEN' : 'PUBLISHED';
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(article.slug, newStatus);
    } catch (err) {
      alert('Failed to update article status: ' + (err.response?.data?.message || err.message));
    }
  };

  const hasHtml = Boolean(article.contentHtml && article.contentHtml.trim().length > 0);
  const sanitizedContentHtml = hasHtml ? DOMPurify.sanitize(article.contentHtml) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isModerator && (
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                  currentStatus === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isHidden
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  STATUS: {currentStatus}
                </span>
              )}

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

            {/* Thumbnail Cover Image just down the Article Title */}
            {(article.coverImageUrl || article.imageUrl) && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800/80 max-h-80 shadow-2xl bg-slate-950">
                <img
                  src={article.coverImageUrl || article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Written by <span className="text-cyan-300 font-bold">@{article.authorUsername || 'dev'}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Moderator Hide / Restore Toggle Button */}
            {isModerator && (
              <button
                onClick={handleToggleVisibility}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-colors ${
                  isHidden
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
                title={isHidden ? 'Restore to Published' : 'Hide from Public Feed'}
              >
                {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isHidden ? 'Restore' : 'Hide Post'}</span>
              </button>
            )}

            {/* Conditionally Rendered Delete Button */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-colors"
                title="Delete Post (Role Privilege)"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Article</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body: WYSIWYG HTML or Legacy Markdown Reader */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto wysiwyg-reader">
          
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

          {hasHtml ? (
            <div
              className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }}
            />
          ) : (
            <ReactMarkdown>{article.contentMarkdown}</ReactMarkdown>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DOMPurify XSS Sanitized View</span>
            </span>

            {/* Upvote Button */}
            <button
              onClick={() => {
                const current = parseInt(localStorage.getItem(`upvotes_${article.slug}`) || '42', 10);
                const isUpvoted = localStorage.getItem(`upvoted_${article.slug}`) === 'true';
                if (isUpvoted) {
                  localStorage.setItem(`upvotes_${article.slug}`, (current - 1).toString());
                  localStorage.setItem(`upvoted_${article.slug}`, 'false');
                } else {
                  localStorage.setItem(`upvotes_${article.slug}`, (current + 1).toString());
                  localStorage.setItem(`upvoted_${article.slug}`, 'true');
                }
                // Force rerender trick
                const btn = document.getElementById(`upvote-count-${article.slug}`);
                if (btn) btn.innerText = isUpvoted ? (current - 1).toString() : (current + 1).toString();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors font-bold"
              title="Upvote technical article"
            >
              <span>👍 Upvote</span>
              <span id={`upvote-count-${article.slug}`}>{localStorage.getItem(`upvotes_${article.slug}`) || '42'}</span>
            </button>
          </div>

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
