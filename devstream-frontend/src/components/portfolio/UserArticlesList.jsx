import React from 'react';
import { BookOpen, Calendar, Eye, ArrowRight, Tag } from 'lucide-react';

export const UserArticlesList = ({ articles = [], onSelectArticle }) => {
  if (!articles || articles.length === 0) {
    return (
      <div className="glass-panel p-8 text-center rounded-3xl border border-slate-800 space-y-3">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-1" />
        <h3 className="text-base font-bold text-white">No Technical Articles Published Yet</h3>
        <p className="text-xs text-slate-400 font-mono">
          Articles published by this developer will appear here in their live engineering portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Authored Technical Articles
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Peer-reviewed technical guides and architectural publications
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
          {articles.length} Published
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <div
            key={article.id || article.slug}
            onClick={() => onSelectArticle && onSelectArticle(article)}
            className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {article.tags && article.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-cyan-400 border border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {article.date || 'Recent'}
                </span>
              </div>

              <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                {article.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {article.summary || 'Technical breakdown of design patterns, performance optimizations, and infrastructure setup.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-mono">
              <span className="text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {article.readCount || `${article.viewCount || 0} Reads`}
              </span>

              <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
