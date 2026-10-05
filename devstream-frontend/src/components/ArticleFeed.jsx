import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useArticles, useDeleteArticle } from '../hooks/useArticles';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from './common/SkeletonLoaders';

import { 
  BookOpen, 
  Search, 
  Tag as TagIcon, 
  Eye, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Terminal,
  Trash2
} from 'lucide-react';

const POPULAR_TAGS = ['all', 'springboot', 'mongodb', 'fastapi', 'architecture', 'react', 'python', 'postgresql'];

export const ArticleFeed = ({ onSelectArticle }) => {
  const navigate = useNavigate();
  const { currentUser, isModerator, isStudent } = useAuth();
  
  const { data: articles = [], isLoading, refetch, isRefetching } = useArticles();
  const deleteMutation = useDeleteArticle();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const handleDeleteArticle = (e, slug) => {
    e.stopPropagation();
    toast('Confirm Deletion', {
      description: `Are you sure you want to delete article "${slug}"?`,
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteMutation.mutateAsync(slug);
            toast.success(`Article "${slug}" deleted.`);
          } catch (err) {
            toast.error('Failed to delete article: ' + (err.response?.data?.message || err.message));
          }
        },
      },
    });
  };

  const handleCardClick = (article) => {
    if (onSelectArticle) {
      onSelectArticle(article);
    }
    if (article.slug) {
      navigate(`/articles/${article.slug}`);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (article.authorUsername && article.authorUsername.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = 
      selectedTag === 'all' || 
      (article.tags && article.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DevStream Technical Articles & Engineering Blogs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Developer-Centric Technical Writing Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Discover peer-reviewed architectural guides, microservice blueprints, code walk-throughs, and live developer portfolios powered by Spring Boot, MongoDB Atlas, and React.
          </p>

          {isStudent && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/editor')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Terminal className="w-4 h-4" />
                <span>Write a Technical Article</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800 shadow-lg">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, tags, authors..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <TagIcon className="w-3 h-3 text-cyan-400" />
            Tags:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                selectedTag === tag
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Refresh Feed */}
        <button
          onClick={() => { refetch(); toast.info('Refetching articles from backend...'); }}
          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Refresh Articles"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
        </button>

      </div>

      {/* Article Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-1" />
          <h3 className="text-lg font-bold text-white">No articles match your criteria</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Try choosing a different tag or clearing your search filter.</p>
          <button
            onClick={() => { setSelectedTag('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => {
            const canDelete = isModerator || (isStudent && currentUser?.username === article.authorUsername);

            return (
              <div
                key={article.id || article.slug}
                onClick={() => handleCardClick(article)}
                className="glass-card p-6 rounded-3xl flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.tags && article.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 text-cyan-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}

                      {article.status && article.status !== 'PUBLISHED' && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {article.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}
                      </span>

                      {canDelete && (
                        <button
                          onClick={(e) => handleDeleteArticle(e, article.slug)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2.5 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {article.summary || article.contentMarkdown?.substring(0, 180) + '...'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (article.authorUsername) navigate(`/portfolio/${article.authorUsername}`);
                    }}
                    className="flex items-center gap-2 hover:underline cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center font-mono">
                      {article.authorUsername ? article.authorUsername.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-mono text-slate-300">
                      @{article.authorUsername || 'dev'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {article.viewCount || 0}
                    </span>

                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
