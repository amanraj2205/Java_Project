import React, { useState, useEffect } from 'react';
import { articleService } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Tag as TagIcon, 
  Eye, 
  Calendar, 
  User, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  TrendingUp,
  Terminal
} from 'lucide-react';

const FALLBACK_ARTICLES = [
  {
    id: "art-1",
    title: "Building Resilient Microservices with Spring Boot & MongoDB Atlas",
    slug: "building-resilient-microservices-spring-boot-mongodb",
    summary: "Architecting domain-driven microservice boundaries, stateless JWT authentication, and hybrid data persistence with local PostgreSQL and Mongo Atlas.",
    contentMarkdown: `# Building Resilient Microservices with Spring Boot & MongoDB Atlas\n\nModern cloud backends demand balancing relational integrity for authentication and dynamic document agility for rich text. In DevStream, we leverage Spring Boot 3 with dual repositories.\n\n## Core Tenets\n- Package by Domain (/identity, /content, /aggregator)\n- Stateless JWT Security\n- Asynchronous Multi-Query Aggregation`,
    tags: ["springboot", "mongodb", "architecture", "microservices"],
    authorUsername: "alex_dev",
    viewCount: 6820,
    createdAt: "2026-09-18T10:15:00Z"
  },
  {
    id: "art-2",
    title: "FastAPI + LangChain: High-Throughput Microservice Patterns for AI",
    slug: "fastapi-langchain-microservice-patterns-production-ai",
    summary: "Deploying asynchronous Python endpoints for automated technical article summarization, zero-shot tagging, and seamless Spring WebClient orchestration.",
    contentMarkdown: `# FastAPI + LangChain: High-Throughput Microservice Patterns for AI\n\nAI pipelines must be isolated from the transactional backend to protect thread pools. DevStream's \`devstream-ai\` microservice wraps LangChain models in FastAPI.\n\n## Endpoints\n- \`POST /api/v1/ai/summarize\`\n- \`POST /api/v1/ai/auto-tag\``,
    tags: ["python", "fastapi", "langchain", "ai"],
    authorUsername: "sarah_cloud",
    viewCount: 4520,
    createdAt: "2026-09-24T14:30:00Z"
  },
  {
    id: "art-3",
    title: "Vite + Tailwind CSS: Crafting Cyber-Developer Aesthetic UIs",
    slug: "vite-tailwind-crafting-cyber-developer-aesthetic-ui",
    summary: "How to use dark mode, glassmorphism, responsive split-pane editors, and custom scrollbars to build an engaging platform for software engineers.",
    contentMarkdown: `# Vite + Tailwind CSS: Crafting Cyber-Developer Aesthetic UIs\n\nDevelopers spend hours reading code and docs. UI design should treat developers with rich dark themes, high-contrast monospace code blocks, and frictionless authoring.`,
    tags: ["react", "vite", "tailwind", "frontend"],
    authorUsername: "elena_ui",
    viewCount: 3180,
    createdAt: "2026-09-28T16:45:00Z"
  },
  {
    id: "art-4",
    title: "Zero-Downtime PostgreSQL Schema Migrations in Cloud Environments",
    slug: "zero-downtime-postgresql-schema-migrations-at-scale",
    summary: "Practical techniques for non-blocking column additions, concurrent index creation, and safe rollback patterns in PostgreSQL.",
    contentMarkdown: `# Zero-Downtime PostgreSQL Schema Migrations in Cloud Environments\n\nDatabase locks during schema alterations cause cascading timeouts in microservices. Here is our checklist for zero-downtime DDL updates.`,
    tags: ["postgresql", "database", "devops"],
    authorUsername: "alex_dev",
    viewCount: 2940,
    createdAt: "2026-09-30T09:00:00Z"
  }
];

const POPULAR_TAGS = ['all', 'springboot', 'mongodb', 'fastapi', 'architecture', 'react', 'python', 'postgresql'];

export const ArticleFeed = ({ onSelectArticle, onNavigateToEditor }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleService.getAllArticles();
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(FALLBACK_ARTICLES);
      }
    } catch (err) {
      console.warn('Backend articles endpoint unreachable, showing curated demo articles:', err.message);
      setArticles(FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (article.authorUsername && article.authorUsername.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = 
      selectedTag === 'all' || 
      (article.tags && article.tags.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Feed Hero Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl mb-10 relative overflow-hidden border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer-Centric Blogging & Knowledge Stream</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Engineering Insights, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Decentralized Architecture.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
            Technical deep-dives written by engineers, backed by Spring Boot, MongoDB Atlas, and FastAPI LangChain AI assistants.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onNavigateToEditor}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Write with AI Markdown Editor</span>
            </button>

            <button
              onClick={fetchArticles}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        
        {/* Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter articles or authors..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs glass-input"
          />
        </div>

      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-56 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
              <div className="h-6 bg-slate-800 rounded w-4/5 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-full mb-2" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No articles match your criteria</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">Try choosing a different tag or clearing your search filter.</p>
          <button
            onClick={() => { setSelectedTag('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id || article.slug}
              onClick={() => onSelectArticle(article)}
              className="glass-card p-6 rounded-3xl flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
            >
              <div>
                {/* Meta bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {article.tags && article.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 text-cyan-400 border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                {/* Article Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2.5 leading-snug">
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {article.summary || article.contentMarkdown.substring(0, 180) + '...'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
                <div className="flex items-center gap-2">
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
          ))}
        </div>
      )}

    </div>
  );
};
