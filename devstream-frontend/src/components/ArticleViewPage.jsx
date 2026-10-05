import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

import { useArticleBySlug } from '../hooks/useArticles';
import { useAuth } from '../context/AuthContext';
import { articleService, moderationService } from '../services/api';
import { LoadingSpinner } from './common/LoadingSpinner';

import {
  Calendar,
  User,
  Eye,
  EyeOff,
  Share2,
  Sparkles,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const ArticleViewPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser, isModerator, isStudent } = useAuth();

  const { data: article, isLoading, isError } = useArticleBySlug(slug);
  const [currentStatus, setCurrentStatus] = useState(article?.status || 'PUBLISHED');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Article Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">
          The requested technical article standard ("{slug}") could not be located.
        </p>
        <button
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Articles Feed</span>
        </button>
      </div>
    );
  }

  const canDelete = isModerator || (isStudent && currentUser?.username === article.authorUsername);
  const isHidden = (currentStatus || article.status) === 'HIDDEN';

  const handleDelete = async () => {
    toast('Confirm Deletion', {
      description: `Are you sure you want to delete "${article.title}"?`,
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await articleService.deleteArticle(article.slug);
            toast.success('Article deleted successfully');
            navigate('/feed');
          } catch (err) {
            toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
          }
        },
      },
    });
  };

  const handleToggleVisibility = async () => {
    const shouldHide = !isHidden;
    try {
      await moderationService.setArticleVisibility(article.slug, shouldHide);
      const newStatus = shouldHide ? 'HIDDEN' : 'PUBLISHED';
      setCurrentStatus(newStatus);
      toast.success(`Article ${shouldHide ? 'hidden from feed' : 'restored to feed'}`);
    } catch (err) {
      toast.error('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article direct link copied to clipboard!');
    }
  };

  const hasHtml = Boolean(article.contentHtml && article.contentHtml.trim().length > 0);
  const sanitizedContentHtml = hasHtml ? DOMPurify.sanitize(article.contentHtml) : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          {isModerator && (
            <button
              onClick={handleToggleVisibility}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isHidden
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{isHidden ? 'Restore' : 'Hide Post'}</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Article Container Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Tags & Metadata */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {article.tags && article.tags.map((t) => (
              <span key={t} className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/30">
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

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {article.title}
          </h1>

          {/* Thumbnail Cover Image */}
          {(article.coverImageUrl || article.imageUrl) && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 shadow-2xl bg-slate-950">
              <img
                src={article.coverImageUrl || article.imageUrl}
                alt={article.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          {/* Author Badge */}
          <div
            onClick={() => article.authorUsername && navigate(`/portfolio/${article.authorUsername}`)}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center font-mono">
              {article.authorUsername ? article.authorUsername.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-xs font-mono text-slate-300">
              Written by <span className="text-cyan-300 font-bold">@{article.authorUsername || 'dev'}</span>
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        {article.summary && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-sm text-cyan-200">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Summary
            </span>
            {article.summary}
          </div>
        )}

        {/* Article Body Content */}
        <div className="wysiwyg-reader pt-4 border-t border-slate-800">
          {hasHtml ? (
            <div
              className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }}
            />
          ) : (
            <ReactMarkdown>{article.contentMarkdown}</ReactMarkdown>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>DOMPurify XSS Protection Enabled</span>
          </span>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Article Link</span>
          </button>
        </div>

      </div>
    </div>
  );
};
