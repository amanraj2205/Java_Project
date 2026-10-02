import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ArticleFeed } from './components/ArticleFeed';
import { MarkdownEditor } from './components/MarkdownEditor';
import { PortfolioDashboard } from './components/PortfolioDashboard';
import { AuthModal } from './components/AuthModal';
import { ArticleModal } from './components/ArticleModal';
import { Code2, Database, Cpu, Globe, Server, Sparkles } from 'lucide-react';

function DevStreamContent() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'editor' | 'portfolio'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);

  const handleOpenArticle = (article) => {
    setSelectedArticle(article);
    setArticleModalOpen(true);
  };

  const handleArticleCreated = (newArticle) => {
    // Navigate to feed and open the new article
    setSelectedArticle(newArticle);
    setArticleModalOpen(true);
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <ArticleFeed
            onSelectArticle={handleOpenArticle}
            onNavigateToEditor={() => setActiveTab('editor')}
          />
        )}

        {activeTab === 'editor' && (
          <MarkdownEditor
            onArticleCreated={handleArticleCreated}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioDashboard
            onSelectArticle={handleOpenArticle}
          />
        )}
      </main>

      {/* Auth Modal (JWT Login & Registration) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => setAuthModalOpen(false)}
      />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
      />

      {/* Modern Developer Platform Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10 mt-16 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-200">DevStream Architecture</div>
              <div className="text-[11px] text-slate-400">Feature-Driven Monorepo Platform</div>
            </div>
          </div>

          {/* Architecture Badges */}
          <div className="flex items-center flex-wrap gap-2 text-[10px]">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 flex items-center gap-1">
              <Server className="w-3 h-3" /> Spring Boot (Java 17+)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-blue-400 flex items-center gap-1">
              <Database className="w-3 h-3" /> PostgreSQL (Local)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-1">
              <Database className="w-3 h-3" /> MongoDB Atlas
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> FastAPI + LangChain
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> React + Vite + Tailwind
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            © 2026 DevStream • Designed for Developers
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DevStreamContent />
    </AuthProvider>
  );
}
