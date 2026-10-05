import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ArticleFeed } from './components/ArticleFeed';

import { Code2, Database, Cpu, Globe, Server } from 'lucide-react';

// Lazy loading heavy components for Code Splitting & Performance
const MarkdownEditor = lazy(() =>
  import('./components/MarkdownEditor').then((module) => ({ default: module.MarkdownEditor }))
);
const PortfolioDashboard = lazy(() =>
  import('./components/PortfolioDashboard').then((module) => ({ default: module.PortfolioDashboard }))
);
const ModeratorDashboard = lazy(() =>
  import('./components/ModeratorDashboard').then((module) => ({ default: module.ModeratorDashboard }))
);
const ArticleViewPage = lazy(() =>
  import('./components/ArticleViewPage').then((module) => ({ default: module.ArticleViewPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function DevStreamContent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleArticleCreated = (newArticle) => {
    if (newArticle?.slug) {
      navigate(`/articles/${newArticle.slug}`);
    } else {
      navigate('/feed');
    }
  };

  const handleAuthSuccess = (user) => {
    setAuthModalOpen(false);
    if (user?.roles?.includes('ROLE_MODERATOR')) {
      navigate('/moderator');
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Global Toast Notification System */}
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* Top Navigation Bar */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Semantic Routes View */}
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            
            <Route
              path="/feed"
              element={
                <ArticleFeed
                  onSelectArticle={(article) => article.slug && navigate(`/articles/${article.slug}`)}
                />
              }
            />

            <Route path="/articles/:slug" element={<ArticleViewPage />} />

            <Route
              path="/editor"
              element={
                <MarkdownEditor
                  onArticleCreated={handleArticleCreated}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
              }
            />

            <Route
              path="/editor/:slug"
              element={
                <MarkdownEditor
                  onArticleCreated={handleArticleCreated}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
              }
            />

            <Route
              path="/portfolio"
              element={<Navigate to={`/portfolio/${currentUser?.username || 'alex_dev'}`} replace />}
            />

            <Route
              path="/portfolio/:username"
              element={
                <PortfolioDashboard
                  onSelectArticle={(article) => article.slug && navigate(`/articles/${article.slug}`)}
                />
              }
            />

            <Route
              path="/moderator"
              element={
                <ProtectedRoute allowedRoles={['ROLE_MODERATOR']}>
                  <ModeratorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <DevStreamContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

