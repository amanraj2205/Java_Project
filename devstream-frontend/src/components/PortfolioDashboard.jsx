import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/api';
import { 
  User, 
  Github, 
  Mail, 
  Sparkles, 
  BookOpen, 
  Eye, 
  Star, 
  GitFork, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Calendar,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react';

// Fallback mock portfolio if local DB hasn't been seeded yet
const MOCK_PORTFOLIO = {
  id: 1,
  username: "alex_dev",
  email: "alex@devstream.io",
  bio: "Lead Systems Architect & Full-Stack Polyglot. Specializing in high-throughput distributed systems, Spring Boot microservices, and AI-assisted workflows.",
  githubUsername: "alexdev",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  totalArticles: 6,
  totalArticleViews: 14280,
  totalGitHubStars: 284,
  aiGeneratedBioSummary: "Alex is an experienced backend and distributed systems architect with extensive expertise in Spring Boot, MongoDB Atlas, and FastAPI. Demonstrates consistent thought leadership in asynchronous event patterns and cloud orchestration.",
  articles: [
    {
      id: "660c1f2e1a2b3c4d5e6f7a8b",
      title: "Building Resilient Microservices with Spring Boot & MongoDB Atlas",
      slug: "building-resilient-microservices-spring-boot-mongodb",
      summary: "In-depth guide to domain-driven microservice boundaries, stateless JWT authentication, and hybrid data persistence using PostgreSQL and MongoDB.",
      tags: ["springboot", "mongodb", "architecture", "microservices"],
      authorUsername: "alex_dev",
      viewCount: 6820,
      createdAt: "2026-09-18T10:15:00Z"
    },
    {
      id: "660c1f2e1a2b3c4d5e6f7a8c",
      title: "FastAPI + LangChain: Microservice Patterns for Production AI",
      slug: "fastapi-langchain-microservice-patterns-production-ai",
      summary: "Deploying high-performance asynchronous Python endpoints for automated technical article summarization and zero-shot tag extraction.",
      tags: ["python", "fastapi", "langchain", "ai"],
      authorUsername: "alex_dev",
      viewCount: 4520,
      createdAt: "2026-09-24T14:30:00Z"
    },
    {
      id: "660c1f2e1a2b3c4d5e6f7a8d",
      title: "Zero-Downtime PostgreSQL Schema Migrations at Scale",
      slug: "zero-downtime-postgresql-schema-migrations-at-scale",
      summary: "Practical strategies for schema changes without lock contention in mission-critical relational databases.",
      tags: ["postgresql", "database", "devops"],
      authorUsername: "alex_dev",
      viewCount: 2940,
      createdAt: "2026-09-30T09:00:00Z"
    }
  ],
  githubRepositories: [
    {
      name: "devstream-core",
      htmlUrl: "https://github.com/alexdev/devstream-core",
      description: "High-throughput developer platform engine with hybrid Postgres & Mongo Atlas persistence.",
      stargazersCount: 142,
      forksCount: 38,
      language: "Java"
    },
    {
      name: "fastapi-langchain-agent",
      htmlUrl: "https://github.com/alexdev/fastapi-langchain-agent",
      description: "Lightweight Python microservice for technical text extraction, summarization and auto-tagging.",
      stargazersCount: 89,
      forksCount: 19,
      language: "Python"
    },
    {
      name: "reactive-orchestrator",
      htmlUrl: "https://github.com/alexdev/reactive-orchestrator",
      description: "Spring WebFlux & Project Reactor aggregator calling distributed REST microservices simultaneously.",
      stargazersCount: 53,
      forksCount: 11,
      language: "Java"
    }
  ]
};

const LANGUAGE_COLORS = {
  Java: '#b07219',
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  Shell: '#89e051',
};

export const PortfolioDashboard = ({ onSelectArticle }) => {
  const { currentUser } = useAuth();
  
  // Default username to view
  const defaultUser = currentUser?.username || 'alex_dev';
  const [searchInput, setSearchInput] = useState(defaultUser);
  const [activeUsername, setActiveUsername] = useState(defaultUser);

  const [portfolio, setPortfolio] = useState(MOCK_PORTFOLIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'repositories'

  const fetchPortfolio = async (usernameToFetch) => {
    if (!usernameToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getDeveloperPortfolio(usernameToFetch);
      if (data && data.username) {
        setPortfolio(data);
      } else {
        // Fallback to mock with updated username
        setPortfolio({
          ...MOCK_PORTFOLIO,
          username: usernameToFetch,
          githubUsername: usernameToFetch,
        });
      }
    } catch (err) {
      console.warn(`Could not fetch live portfolio for @${usernameToFetch} from backend. Using rich demo aggregator state:`, err.message);
      // Fallback gracefully to demo portfolio so UI never breaks
      setPortfolio({
        ...MOCK_PORTFOLIO,
        username: usernameToFetch,
        githubUsername: usernameToFetch,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio(activeUsername);
  }, [activeUsername]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveUsername(searchInput.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Search & Lookup Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-6 h-6" />
            </span>
            Live Portfolio Aggregator
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Aggregating PostgreSQL identities, MongoDB technical articles, GitHub stats, & AI summaries
          </p>
        </div>

        {/* Developer Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search developer username..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs glass-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Fetch'}
          </button>
        </form>
      </div>

      {/* Developer Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-8 relative overflow-hidden">
        {/* Background glow orb */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Identity info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/10 shrink-0">
              <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
                {portfolio.avatarUrl ? (
                  <img src={portfolio.avatarUrl} alt={portfolio.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-cyan-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-white">
                  @{portfolio.username}
                </h2>
                {portfolio.githubUsername && (
                  <a
                    href={`https://github.com/${portfolio.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    github.com/{portfolio.githubUsername}
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                )}
              </div>

              {portfolio.email && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{portfolio.email}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {portfolio.bio || "Full-stack developer building on the DevStream platform."}
              </p>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => fetchPortfolio(activeUsername)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all self-end md:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>

        </div>

        {/* AI-Generated Bio Summary Banner */}
        {portfolio.aiGeneratedBioSummary && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/20 border border-cyan-500/30 relative">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                AI Synthesized Developer Profile (LangChain Service)
              </span>
            </div>
            <p className="text-xs text-cyan-100/90 leading-relaxed font-sans">
              "{portfolio.aiGeneratedBioSummary}"
            </p>
          </div>
        )}

      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        
        {/* Metric 1: Articles */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Total Articles</span>
            <div className="text-2xl font-black text-white">
              {portfolio.totalArticles || (portfolio.articles ? portfolio.articles.length : 0)}
            </div>
          </div>
        </div>

        {/* Metric 2: Views */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Total Article Reads</span>
            <div className="text-2xl font-black text-white">
              {(portfolio.totalArticleViews || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metric 3: Stars */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase text-slate-400">Total GitHub Stars</span>
            <div className="text-2xl font-black text-white">
              {(portfolio.totalGitHubStars || 0).toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'articles'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Published Articles ({portfolio.articles ? portfolio.articles.length : 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('repositories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
            activeTab === 'repositories'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repositories ({portfolio.githubRepositories ? portfolio.githubRepositories.length : 0})</span>
        </button>
      </div>

      {/* Tab Content 1: Articles List */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {(!portfolio.articles || portfolio.articles.length === 0) ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No published articles found for this developer yet.</p>
            </div>
          ) : (
            portfolio.articles.map((article) => (
              <div
                key={article.id || article.slug}
                onClick={() => onSelectArticle && onSelectArticle(article)}
                className="glass-card p-5 rounded-2xl cursor-pointer group hover:scale-[1.005] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {article.tags && article.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                        #{t}
                      </span>
                    ))}
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    {article.viewCount || 0} reads
                  </span>

                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content 2: GitHub Repositories Grid */}
      {activeTab === 'repositories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(!portfolio.githubRepositories || portfolio.githubRepositories.length === 0) ? (
            <div className="col-span-full glass-panel p-12 text-center rounded-2xl">
              <Github className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No public GitHub repositories found for this account.</p>
            </div>
          ) : (
            portfolio.githubRepositories.map((repo) => (
              <a
                key={repo.name}
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-card p-5 rounded-2xl flex flex-col justify-between group hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors font-mono">
                        {repo.name}
                      </h4>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {repo.description || "Public repository for open-source development."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                  {/* Language */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#94a3b8' }}
                    />
                    <span>{repo.language || 'Code'}</span>
                  </div>

                  {/* Stars & Forks */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 hover:text-amber-400">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stargazersCount || 0}
                    </span>
                    <span className="flex items-center gap-1 hover:text-cyan-400">
                      <GitFork className="w-3 h-3 text-cyan-400" />
                      {repo.forksCount || 0}
                    </span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}

    </div>
  );
};
