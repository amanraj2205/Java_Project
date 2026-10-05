import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { articleService, portfolioService, mediaService } from '../services/api';
import { 
  FileText, 
  BarChart3, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Send, 
  Eye, 
  Star, 
  Github, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  User,
  Settings,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR_URL = "./image/avatar.png";

export const StudentDashboard = ({ onOpenEditorWithDraft }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' | 'analytics' | 'edit-portfolio'
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Portfolio edit form states
  const [editBio, setEditBio] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editAvatar, setEditAvatar] = useState(DEFAULT_AVATAR_URL);
  const [savingPortfolio, setSavingPortfolio] = useState(false);

  useEffect(() => {
    fetchDrafts();
    fetchPortfolio();
  }, [currentUser]);

  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const data = await articleService.getMyDrafts();
      setDrafts(data || []);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const fetchPortfolio = async () => {
    if (!currentUser?.username) return;
    setLoadingPortfolio(true);
    try {
      const data = await portfolioService.getDeveloperPortfolio(currentUser.username);
      setPortfolio(data);
      setEditBio(data.bio || '');
      setEditGithub(data.githubUsername || '');
      setEditAvatar(data.avatarUrl || DEFAULT_AVATAR_URL);
    } catch (err) {
      console.error('Failed to load portfolio analytics:', err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handlePublishDraft = async (draft) => {
    try {
      await articleService.updateArticle(draft.slug, {
        ...draft,
        status: 'PUBLISHED'
      });
      setStatusMsg(`"${draft.title}" published successfully!`);
      fetchDrafts();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error publishing draft:', err);
      alert('Failed to publish draft: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDraft = async (slug) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await articleService.deleteArticle(slug);
      setStatusMsg('Draft deleted successfully.');
      setDrafts(drafts.filter(d => d.slug !== slug));
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('Failed to delete draft: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    setSavingPortfolio(true);
    try {
      const updated = await portfolioService.updatePortfolio(currentUser.username, {
        bio: editBio,
        githubUsername: editGithub,
        avatarUrl: editAvatar
      });
      setPortfolio(updated);
      setStatusMsg('Portfolio updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error updating portfolio:', err);
      alert('Failed to update portfolio: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingPortfolio(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Student Author Banner */}
      <div className="relative rounded-3xl p-8 mb-8 overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-cyan-950/30 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/20">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Student Author Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ROLE_STUDENT_AUTHOR
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                Verified Student Author • @{currentUser?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Article</span>
            </button>
            <button
              onClick={() => navigate(`/portfolio/${currentUser?.username}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Portfolio</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-8 pb-3">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'drafts'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Draft Manager ({drafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Portfolio Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('edit-portfolio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'edit-portfolio'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Edit Portfolio Profile</span>
        </button>
      </div>

      {/* Tab 1: Drafts Manager */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Unpublished Drafts</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              MongoDB Draft Storage
            </span>
          </div>

          {loadingDrafts ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse">
                  <div className="h-5 bg-slate-800 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : drafts.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No drafts in progress</h3>
              <p className="text-xs text-slate-400 font-mono mb-4">
                Start writing a new technical guide or research note.
              </p>
              <button
                onClick={() => navigate('/editor')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Launch Technical Editor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id || draft.slug}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        DRAFT
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {draft.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-mono">
                      {draft.summary || draft.contentMarkdown?.substring(0, 100) || 'No summary'}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                      <span>Slug: /{draft.slug}</span>
                      <span>•</span>
                      <span>Read Time: {draft.readTimeMinutes || 1} min</span>
                      <span>•</span>
                      <span>Last Modified: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handlePublishDraft(draft)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                      title="Publish this article"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenEditorWithDraft) {
                          onOpenEditorWithDraft(draft);
                        } else {
                          navigate('/editor', { state: { draft } });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDraft(draft.slug)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Portfolio Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono font-medium">Total Articles</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {portfolio?.totalArticles ?? drafts.length}
              </div>
              <span className="text-[11px] text-cyan-400/80 font-mono mt-1 block">
                Published & drafts
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono font-medium">Total Article Views</span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {portfolio?.totalArticleViews ?? 0}
              </div>
              <span className="text-[11px] text-indigo-400/80 font-mono mt-1 block">
                Aggregated reader impressions
              </span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-slate-900/60">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono font-medium">GitHub Stars</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {portfolio?.totalGitHubStars ?? 0}
              </div>
              <span className="text-[11px] text-amber-400/80 font-mono mt-1 block">
                Across public repositories
              </span>
            </div>

          </div>

          {/* AI Generated Bio & Overview */}
          {portfolio?.aiGeneratedBioSummary && (
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-cyan-950/20">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                  AI-Aggregated Developer Summary (FastAPI Microservice)
                </h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {portfolio.aiGeneratedBioSummary}
              </p>
            </div>
          )}

          {/* Quick Portfolio Preview Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Current Portfolio Details</span>
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Username:</span>
                <span className="text-white">@{portfolio?.username || currentUser?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">GitHub Handle:</span>
                <span className="text-cyan-400">{portfolio?.githubUsername || 'Not connected'}</span>
              </div>
              <div className="py-2 border-b border-slate-800/80">
                <span className="text-slate-400 block mb-1">Bio:</span>
                <span className="text-slate-200 font-sans">{portfolio?.bio || 'No bio provided yet.'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Edit Portfolio */}
      {activeTab === 'edit-portfolio' && (
        <div className="max-w-2xl glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/60">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>Edit Developer Portfolio</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mb-6">
            Authorized student authors can customize their portfolio attributes stored in PostgreSQL.
          </p>

          <form onSubmit={handleSavePortfolio} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Bio & Technical Focus
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                placeholder="e.g. Distributed systems enthusiast, Java Spring Boot & React developer."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                GitHub Username
              </label>
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3">
                <Github className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  placeholder="github-handle"
                  className="w-full py-2.5 bg-transparent focus:outline-none text-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Profile Avatar Picture
              </label>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="w-16 h-16 rounded-xl border border-slate-700 overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={editAvatar || DEFAULT_AVATAR_URL}
                    onError={(e) => { e.target.src = DEFAULT_AVATAR_URL; }}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="student-avatar-file-input"
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File from Device</span>
                    </label>
                    <input
                      type="file"
                      id="student-avatar-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const objectUrl = URL.createObjectURL(file);
                        setEditAvatar(objectUrl);
                        try {
                          const res = await mediaService.uploadImage(file, 'avatars');
                          if (res?.url) {
                            setEditAvatar(res.url);
                            setStatusMsg('Avatar uploaded successfully!');
                            setTimeout(() => setStatusMsg(''), 3000);
                          }
                        } catch (err) {
                          console.warn('Cloudinary upload notice, using local blob image preview:', err);
                        }
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="./image/avatar.png"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingPortfolio}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-colors"
              >
                {savingPortfolio ? 'Saving Changes...' : 'Save Portfolio Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
