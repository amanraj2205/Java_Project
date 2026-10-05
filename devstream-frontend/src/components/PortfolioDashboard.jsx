import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/api';
import { 
  User, 
  Github, 
  Linkedin,
  Globe,
  FileText,
  MapPin,
  Pin,
  Edit3,
  Save,
  X,
  ExternalLink,
  BookOpen, 
  Star,
  Code,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Search,
  Calendar,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_PORTFOLIO = {
  fullName: "Aman R.",
  username: "aman.developer",
  bio: "Full Stack Developer | AI Enthusiast | CS '25 (Amity University, Kukas)",
  location: "Kukas, Rajasthan, India",
  githubUrl: "https://github.com/aman-dev",
  githubUsername: "aman-dev",
  linkedinUrl: "https://linkedin.com/in/amanr",
  portfolioUrl: "https://amanr.dev",
  resumeUrl: "https://devstream.io/resume.pdf",
  resumeLabel: "PDF Download",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  skills: [
    "React",
    "Spring Boot",
    "Java",
    "Python",
    "MongoDB",
    "PostgreSQL",
    "AI/ML",
    "DevOps"
  ],
  articles: [
    {
      id: "1",
      title: "Optimizing Microservices with Spring Boot & MongoDB",
      slug: "optimizing-microservices-spring-boot-mongodb",
      summary: "Deep dive into architecture, performance tuning, and cross-database mapping with code samples...",
      tags: ["Backend", "Java", "Nosql"],
      date: "Oct 1, 2026",
      readCount: "1.2k Reads",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80"
    },
    {
      id: "2",
      title: "Implementing AI Summarization with LangChain in DevStream",
      slug: "implementing-ai-summarization-langchain",
      summary: "Integrating LangChain for automatic abstract generation, artifacts and more relevant summaries...",
      tags: ["AI", "Python", "LLM"],
      date: "Sept 28, 2026",
      readCount: "940 Reads",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80"
    }
  ],
  pinnedRepositories: [
    {
      id: "repo-1",
      name: "DevStream-Platform",
      stars: 145,
      language: "Python/Java",
      description: "Core application build, on DevStream-Platform engine with hybrid persistence.",
      htmlUrl: "https://github.com/aman-dev/DevStream-Platform"
    },
    {
      id: "repo-2",
      name: "ML-Model-Integration",
      stars: 68,
      language: "Python",
      description: "AI microservice for text analysis, summarization, and tag extraction.",
      htmlUrl: "https://github.com/aman-dev/ML-Model-Integration"
    },
    {
      id: "repo-3",
      name: "Reactive-Microservice-Hub",
      stars: 92,
      language: "Java/Spring",
      description: "High-performance event-driven microservices hub built with Spring WebFlux.",
      htmlUrl: "https://github.com/aman-dev/Reactive-Microservice-Hub"
    },
    {
      id: "repo-4",
      name: "DevStream-Frontend-UI",
      stars: 54,
      language: "TypeScript/React",
      description: "Developer-first blogging and portfolio aggregator frontend interface.",
      htmlUrl: "https://github.com/aman-dev/DevStream-Frontend-UI"
    }
  ]
};

const SKILL_COLOR_MAP = {
  'React': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'Spring Boot': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Java': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Python': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'MongoDB': 'bg-green-600/20 text-green-300 border-green-500/40',
  'PostgreSQL': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'AI/ML': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'DevOps': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const getSkillStyle = (skillName) => {
  if (SKILL_COLOR_MAP[skillName]) return SKILL_COLOR_MAP[skillName];
  const colorList = [
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'bg-sky-500/20 text-sky-300 border-sky-500/40',
  ];
  let hash = 0;
  for (let i = 0; i < skillName.length; i++) hash = skillName.charCodeAt(i) + ((hash << 5) - hash);
  return colorList[Math.abs(hash) % colorList.length];
};

export const PortfolioDashboard = ({ onSelectArticle }) => {
  const { currentUser } = useAuth();

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('devstream_custom_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PORTFOLIO;
      }
    }
    return DEFAULT_PORTFOLIO;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_PORTFOLIO);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(portfolio.username);

  // Sync logged in user if available
  useEffect(() => {
    if (currentUser && currentUser.username) {
      setPortfolio(prev => ({
        ...prev,
        username: currentUser.username,
        fullName: currentUser.username,
        githubUsername: currentUser.githubUsername || prev.githubUsername,
      }));
    }
  }, [currentUser]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setPortfolio(editForm);
    localStorage.setItem('devstream_custom_portfolio', JSON.stringify(editForm));
    setIsEditModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editForm.skills.includes(newSkillInput.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkillInput.trim()]
      }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handlePinnedRepoChange = (index, field, value) => {
    const updated = [...editForm.pinnedRepositories];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm(prev => ({ ...prev, pinnedRepositories: updated }));
  };

  const handleAddPinnedRepo = () => {
    if (editForm.pinnedRepositories.length >= 4) return;
    const newRepo = {
      id: `repo-${Date.now()}`,
      name: "New-Repository",
      stars: 10,
      language: "JavaScript",
      description: "Description of open source project.",
      htmlUrl: "https://github.com"
    };
    setEditForm(prev => ({
      ...prev,
      pinnedRepositories: [...prev.pinnedRepositories, newRepo]
    }));
  };

  const handleRemovePinnedRepo = (id) => {
    setEditForm(prev => ({
      ...prev,
      pinnedRepositories: prev.pinnedRepositories.filter(r => r.id !== id)
    }));
  };

  const openEditModal = () => {
    setEditForm({ ...portfolio });
    setIsEditModalOpen(true);
  };

  const handleFetchSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const data = await portfolioService.getDeveloperPortfolio(searchInput.trim());
      if (data && data.username) {
        setPortfolio(prev => ({
          ...prev,
          username: data.username,
          fullName: data.username,
          githubUsername: data.githubUsername || searchInput.trim(),
          bio: data.bio || prev.bio,
          articles: data.articles && data.articles.length > 0 ? data.articles.map(a => ({
            id: a.id || a.slug,
            title: a.title,
            slug: a.slug,
            summary: a.summary,
            tags: a.tags || ["Tech"],
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 1, 2026',
            readCount: `${a.viewCount || 100} Reads`,
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80"
          })) : prev.articles,
          pinnedRepositories: data.githubRepositories && data.githubRepositories.length > 0 ? data.githubRepositories.slice(0, 4).map((r, i) => ({
            id: `repo-${i}`,
            name: r.name,
            stars: r.stargazersCount || 0,
            language: r.language || 'Code',
            description: r.description || 'Public repository',
            htmlUrl: r.htmlUrl || `https://github.com/${data.githubUsername}/${r.name}`
          })) : prev.pinnedRepositories
        }));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Top 4 pinned repositories only
  const top4PinnedRepos = (portfolio.pinnedRepositories || []).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      {/* Date Ribbon Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-mono mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Date: Thursday, Oct 1, 2026</span>
          <span className="text-slate-600">|</span>
          <span>Location: Kukas, India</span>
        </div>

        {/* Live Search */}
        <form onSubmit={handleFetchSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Lookup username..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none w-48"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Main Profile Grid: Left Sidebar & Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT SIDEBAR (User Profile Card) ================= */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl relative space-y-6">
          
          {/* Edit Profile Button Top Right */}
          <button
            onClick={openEditModal}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold text-xs transition-all shadow-md group"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400 group-hover:text-slate-950" />
            <span>Edit Profile</span>
          </button>

          {/* Profile Picture */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative w-36 h-36 rounded-2xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-xl shadow-cyan-500/10 mb-4">
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.fullName}
                className="w-full h-full object-cover rounded-xl bg-slate-950"
              />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {portfolio.fullName}
            </h2>
            <p className="text-xs font-mono text-cyan-400 mt-0.5">
              @{portfolio.username}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mt-3 px-2 font-medium">
              {portfolio.bio}
            </p>
          </div>

          {/* User Links / Location list */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300 font-sans">
            
            {/* Location */}
            {portfolio.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {/* GitHub */}
            {portfolio.githubUrl && (
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={portfolio.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline truncate"
                >
                  {portfolio.githubUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* LinkedIn */}
            {portfolio.linkedinUrl && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={portfolio.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline truncate"
                >
                  {portfolio.linkedinUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.portfolioUrl && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={portfolio.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline truncate"
                >
                  {portfolio.portfolioUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Resume */}
            {portfolio.resumeUrl && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={portfolio.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>{portfolio.resumeLabel || 'PDF Download'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

          </div>

          {/* Skill Badges */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Skill Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills && portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono border transition-all ${getSkillStyle(skill)}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Technical Articles (Blogging) */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
              <span>Technical Articles (Blogging)</span>
            </h2>

            <div className="space-y-4">
              {(!portfolio.articles || portfolio.articles.length === 0) ? (
                <p className="text-xs text-slate-500 font-mono">No articles published yet.</p>
              ) : (
                portfolio.articles.map((article, idx) => (
                  <div
                    key={article.id || idx}
                    onClick={() => onSelectArticle && onSelectArticle(article)}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all group flex flex-col sm:flex-row items-start justify-between gap-5"
                  >
                    {/* Article Content */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-white text-base mr-1">
                          {idx + 1}.
                        </span>
                        <span className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {article.title}
                        </span>
                      </div>

                      {/* Tag Badges & Date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.tags && article.tags.map((tag) => (
                          <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-cyan-400 border border-slate-800">
                            #{tag}
                          </span>
                        ))}
                        <span className="text-xs font-mono text-slate-400 ml-1">
                          {article.date}
                        </span>
                      </div>

                      {/* Summary & Reads */}
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        <strong className="text-slate-300 font-semibold">Summary:</strong> {article.summary}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pt-1">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{article.readCount}</span>
                      </div>
                    </div>

                    {/* Right Thumbnail Image */}
                    {article.imageUrl && (
                      <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Project Highlights (GitHub API) - Top 4 Pinned Repos */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Project Highlights (GitHub API)</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                <Pin className="w-3.5 h-3.5" /> Pinned
              </span>
            </div>

            {/* 2x2 Grid showing maximum top 4 pinned repos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {top4PinnedRepos.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500 font-mono">
                  No pinned repositories available.
                </div>
              ) : (
                top4PinnedRepos.map((repo) => (
                  <a
                    key={repo.id || repo.name}
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                          <Code className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate">{repo.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 shrink-0">
                          Stars: {repo.stars}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-cyan-300/80 mb-2">
                        Stars: {repo.stars} &nbsp;|&nbsp; {repo.language}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-300 font-semibold">Desc:</strong> {repo.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-2 text-[11px] font-mono text-cyan-400 group-hover:underline">
                      <span>View GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Update DevStream Portfolio</h3>
                  <p className="text-xs font-mono text-slate-400">Modify your public profile & pinned project showcases</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              
              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Username Handle</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-slate-300 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-slate-300 mb-1">Role / Bio Tagline</label>
                  <textarea
                    rows="2"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Portfolio Website URL</label>
                  <input
                    type="text"
                    value={editForm.portfolioUrl}
                    onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Resume Download URL</label>
                  <input
                    type="text"
                    value={editForm.resumeUrl}
                    onChange={(e) => setEditForm({ ...editForm, resumeUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Skill Badges Editor */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="block font-mono text-slate-300">Skill Badges</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editForm.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1.5 font-mono text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add new skill (e.g. Docker, Rust)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold font-mono"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Pinned Repositories Editor (Max 4) */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-slate-300">
                    Top 4 Pinned Repositories ({editForm.pinnedRepositories.length}/4)
                  </label>
                  {editForm.pinnedRepositories.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddPinnedRepo}
                      className="flex items-center gap-1 text-cyan-400 hover:underline font-mono text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Pinned Repo
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {editForm.pinnedRepositories.map((repo, idx) => (
                    <div key={repo.id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={repo.name}
                          onChange={(e) => handlePinnedRepoChange(idx, 'name', e.target.value)}
                          placeholder="Repo Name"
                          className="font-bold text-white bg-transparent border-b border-slate-800 focus:border-cyan-500 outline-none w-1/2"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={repo.stars}
                            onChange={(e) => handlePinnedRepoChange(idx, 'stars', parseInt(e.target.value) || 0)}
                            placeholder="Stars"
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePinnedRepo(repo.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={repo.language}
                          onChange={(e) => handlePinnedRepoChange(idx, 'language', e.target.value)}
                          placeholder="Languages (e.g. Python/Java)"
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
                        />
                        <input
                          type="text"
                          value={repo.htmlUrl}
                          onChange={(e) => handlePinnedRepoChange(idx, 'htmlUrl', e.target.value)}
                          placeholder="Repo URL"
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs"
                        />
                      </div>

                      <textarea
                        rows="2"
                        value={repo.description}
                        onChange={(e) => handlePinnedRepoChange(idx, 'description', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
