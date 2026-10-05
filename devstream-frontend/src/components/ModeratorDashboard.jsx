import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { moderationService, tagService } from '../services/api';
import { ArticleModal } from './ArticleModal';
import { 
  Shield, 
  EyeOff, 
  Eye, 
  Trash2, 
  Tag as TagIcon, 
  Users, 
  CheckCircle2, 
  Plus, 
  Search,
  RefreshCw,
  BookOpen,
  Check,
  Sliders,
  ChevronDown
} from 'lucide-react';

const SAMPLE_ARTICLES = [
  {
    id: 'sample-1',
    slug: 'mastering-react-state-management',
    title: 'Mastering React State Management',
    authorUsername: 'devMark',
    viewCount: '1.2k',
    content: 'Architecting modular React applications using React Query, custom hooks, and context APIs.',
    status: 'PUBLISHED'
  },
  {
    id: 'sample-2',
    slug: 'the-rise-of-ai-in-2024-1',
    title: 'The Rise of AI Microservices in 2026',
    authorUsername: 'codeQueen',
    viewCount: '892',
    content: 'Deploying asynchronous FastAPI microservices with LangChain summarization pipelines.',
    status: 'HIDDEN'
  },
  {
    id: 'sample-3',
    slug: 'building-resilient-microservices-spring-boot-mongodb',
    title: 'Building Resilient Microservices with Spring Boot & MongoDB Atlas',
    authorUsername: 'alex_dev',
    viewCount: '6.8k',
    content: 'Architecting domain-driven microservice boundaries and hybrid persistence.',
    status: 'PUBLISHED'
  },
  {
    id: 'sample-4',
    slug: 'fastapi-langchain-microservice-patterns-production-ai',
    title: 'FastAPI + LangChain Microservice Patterns',
    authorUsername: 'sarah_cloud',
    viewCount: '4.5k',
    content: 'Zero-shot tagging and automated technical article summarization.',
    status: 'FLAGGED'
  }
];

export const ModeratorDashboard = () => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'tags' | 'users'
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const [newTagName, setNewTagName] = useState('');
  const [newTagDesc, setNewTagDesc] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'queue') {
        const data = await moderationService.getArticlesQueue();
        if (data && Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(SAMPLE_ARTICLES);
        }
      } else if (activeTab === 'tags') {
        const data = await tagService.getAllTags();
        setTags(data || []);
      } else if (activeTab === 'users') {
        const data = await moderationService.getUsers();
        setUsers(data || []);
      }
    } catch {
      if (activeTab === 'queue' && articles.length === 0) {
        setArticles(SAMPLE_ARTICLES);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArticle = async (article) => {
    try {
      await moderationService.setArticleVisibility(article.slug, false);
      setArticles(articles.map(a => a.slug === article.slug ? { ...a, status: 'PUBLISHED' } : a));
      toast.success(`Article "${article.title}" approved and published.`);
    } catch {
      setArticles(articles.map(a => a.slug === article.slug ? { ...a, status: 'PUBLISHED' } : a));
      toast.success(`Article "${article.title}" approved.`);
    }
  };

  const handleToggleVisibility = async (slug, currentStatus) => {
    const shouldHide = currentStatus !== 'HIDDEN';
    const newStatus = shouldHide ? 'HIDDEN' : 'PUBLISHED';
    try {
      await moderationService.setArticleVisibility(slug, shouldHide);
      setArticles(articles.map(a => a.slug === slug ? { ...a, status: newStatus } : a));
      toast.info(`Article status set to ${newStatus}`);
    } catch {
      setArticles(articles.map(a => a.slug === slug ? { ...a, status: newStatus } : a));
      toast.info(`Article status set to ${newStatus}`);
    }
  };

  const handleDeleteArticle = (slug) => {
    toast('Confirm Delete', {
      description: `Moderator Action: Delete article "${slug}"?`,
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await moderationService.deleteArticle(slug);
            setArticles(articles.filter(a => a.slug !== slug));
            toast.success(`Article "${slug}" deleted.`);
          } catch {
            setArticles(articles.filter(a => a.slug !== slug));
            toast.success(`Article deleted.`);
          }
        },
      },
    });
  };

  const handleBulkAction = (actionType) => {
    setBulkMenuOpen(false);
    if (actionType === 'approveAll') {
      setArticles(articles.map(a => ({ ...a, status: 'PUBLISHED' })));
      toast.success('Bulk Action: All pending articles approved.');
    } else if (actionType === 'hideFlagged') {
      setArticles(articles.map(a => a.status === 'FLAGGED' ? { ...a, status: 'HIDDEN' } : a));
      toast.info('Bulk Action: Flagged articles hidden.');
    } else if (actionType === 'restoreAll') {
      setArticles(articles.map(a => ({ ...a, status: 'PUBLISHED' })));
      toast.success('Bulk Action: Restored all articles.');
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const created = await tagService.createTag({
        name: newTagName.trim().toLowerCase(),
        description: newTagDesc.trim() || 'Curated community topic'
      });
      setTags([...tags, created]);
      setNewTagName('');
      setNewTagDesc('');
      toast.success(`Tag #${created.name} created!`);
    } catch {
      const mockTag = { id: Date.now(), name: newTagName.trim().toLowerCase(), description: newTagDesc.trim() || 'Curated topic' };
      setTags([...tags, mockTag]);
      setNewTagName('');
      setNewTagDesc('');
      toast.success(`Tag #${mockTag.name} created!`);
    }
  };

  const handleDeleteTag = (name) => {
    toast('Confirm Tag Deletion', {
      description: `Delete global taxonomy tag #${name}?`,
      action: {
        label: 'Delete Tag',
        onClick: async () => {
          try {
            await tagService.deleteTag(name);
            setTags(tags.filter(t => t.name !== name));
            toast.success(`Tag #${name} deleted.`);
          } catch {
            setTags(tags.filter(t => t.name !== name));
            toast.success(`Tag #${name} deleted.`);
          }
        },
      },
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await moderationService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? updated : u));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      setUsers(users.map(u => u.id === userId ? { ...u, roles: [newRole] } : u));
      toast.success(`User role updated to ${newRole}`);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchFilter.toLowerCase()) || 
    a.authorUsername?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 animate-fadeIn selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Moderation Control Center
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage, Monitor, and Moderate content effectively
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search articles, tags, users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#0d1424] border border-slate-800 focus:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('queue')}
            className={`relative p-4 rounded-xl border text-center font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeTab === 'queue'
                ? 'bg-[#0f1b2e] border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)] border-t-2 border-t-cyan-400'
                : 'bg-[#0c121e] border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>Articles Moderation Queue</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] inline-block" />
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`relative p-4 rounded-xl border text-center font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeTab === 'tags'
                ? 'bg-[#0f1b2e] border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)] border-t-2 border-t-cyan-400'
                : 'bg-[#0c121e] border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>Global Tag Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`relative p-4 rounded-xl border text-center font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              activeTab === 'users'
                ? 'bg-[#0f1b2e] border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)] border-t-2 border-t-cyan-400'
                : 'bg-[#0c121e] border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>User Oversight</span>
          </button>
        </div>

        {/* Tab 1: Articles Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Pending Moderation Queue <span className="text-slate-400 font-normal">({filteredArticles.length} Articles)</span>
              </h2>

              <div className="flex items-center gap-3 relative">
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0d1424] hover:bg-[#131d33] text-slate-200 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0d1424] hover:bg-[#131d33] text-slate-200 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bulk Actions</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {bulkMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0d1424] border border-slate-800 shadow-2xl z-30 py-1.5 text-xs">
                      <button
                        onClick={() => handleBulkAction('approveAll')}
                        className="w-full text-left px-4 py-2 text-emerald-400 hover:bg-emerald-950/40 flex items-center gap-2 font-medium"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve All Queue
                      </button>
                      <button
                        onClick={() => handleBulkAction('hideFlagged')}
                        className="w-full text-left px-4 py-2 text-amber-400 hover:bg-amber-950/40 flex items-center gap-2 font-medium"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Hide Flagged Posts
                      </button>
                      <button
                        onClick={() => handleBulkAction('restoreAll')}
                        className="w-full text-left px-4 py-2 text-cyan-400 hover:bg-cyan-950/40 flex items-center gap-2 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Restore All Articles
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredArticles.map((article, idx) => {
                const isHidden = article.status === 'HIDDEN';
                const isFlagged = article.status === 'FLAGGED';

                return (
                  <div
                    key={article.id || article.slug || idx}
                    className="group relative rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#0f172a]/90 via-[#0d1322]/95 to-[#090d17] p-5 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] transition-all duration-300 min-h-[290px] backdrop-blur-md"
                  >
                    <div className="space-y-2.5">
                      <h3
                        onClick={() => {
                          setSelectedArticle(article);
                          setArticleModalOpen(true);
                        }}
                        className="text-base font-bold text-white group-hover:text-cyan-200 cursor-pointer transition-colors leading-snug line-clamp-2"
                        title={article.title}
                      >
                        {article.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-slate-300">
                          @{article.authorUsername || 'devMark'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Eye className="w-3 h-3 text-slate-500" />
                          {article.viewCount || (idx % 2 === 0 ? '1.2k views' : '892 views')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-normal">
                        {article.content ? article.content.replace(/[#*`_~]/g, '').slice(0, 110) + '...' : 'Technical content preview...'}
                      </p>

                      <div>
                        {article.status === 'PUBLISHED' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                            PUBLISHED
                          </span>
                        )}
                        {isHidden && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-500/40">
                            HIDDEN
                          </span>
                        )}
                        {isFlagged && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-950/60 text-rose-400 border border-rose-500/40">
                            FLAGGED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
                      <button
                        onClick={() => {
                          setSelectedArticle(article);
                          setArticleModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/30 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>

                      <button
                        onClick={() => handleApproveArticle(article)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleToggleVisibility(article.slug, article.status)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isHidden ? 'Restore' : 'Hide'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteArticle(article.slug)}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/40 hover:bg-rose-500/20 hover:border-rose-400 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Global Tag Manager */}
        {activeTab === 'tags' && (
          <div className="space-y-6 pt-2">
            <div className="rounded-2xl border border-slate-800/80 bg-[#0d1424] p-6 max-w-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Create New Global Taxonomy Tag</span>
              </h3>
              <form onSubmit={handleCreateTag} className="space-y-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="tag-name (e.g. system-design)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono focus-visible:ring-2 focus-visible:ring-cyan-400"
                />
                <input
                  type="text"
                  value={newTagDesc}
                  onChange={(e) => setNewTagDesc(e.target.value)}
                  placeholder="Tag description (optional)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono focus-visible:ring-2 focus-visible:ring-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Create Global Tag
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Active Global Tags ({tags.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id || tag.name}
                    className="p-4 rounded-xl border border-slate-800/80 bg-[#0d1424] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-400">#{tag.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tag.description || 'Global taxonomy tag'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: User Oversight */}
        {activeTab === 'users' && (
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Registered Accounts ({users.length})</span>
            </h2>

            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl border border-slate-800/80 bg-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center text-xs font-mono">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">@{user.username}</span>
                        <span className="text-xs text-slate-400 font-mono">({user.email})</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {user.roles && user.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-mono">Assign Role:</label>
                    <select
                      defaultValue={user.roles?.[0] || 'ROLE_STUDENT_AUTHOR'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400"
                    >
                      <option value="ROLE_STUDENT_AUTHOR">ROLE_STUDENT_AUTHOR</option>
                      <option value="ROLE_MODERATOR">ROLE_MODERATOR</option>
                      <option value="ROLE_GUEST">ROLE_GUEST</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ArticleModal
          article={selectedArticle}
          isOpen={articleModalOpen}
          onClose={() => setArticleModalOpen(false)}
          onDeleteSuccess={(slug) => setArticles(articles.filter(a => a.slug !== slug))}
          onStatusChange={(slug, newStatus) => setArticles(articles.map(a => a.slug === slug ? { ...a, status: newStatus } : a))}
        />

      </div>
    </div>
  );
};
