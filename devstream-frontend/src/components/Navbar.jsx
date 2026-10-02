import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  BookOpen, 
  PenTool, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Sparkles,
  Github
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black">
              <Code2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  DevStream
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                stream://developer.hub
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Articles Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Markdown Editor</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Live Portfolio</span>
            </button>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setActiveTab('portfolio')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-slate-950">
                    {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-slate-200">
                      @{currentUser.username}
                    </span>
                    {currentUser.githubUsername && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Github className="w-2.5 h-2.5" />
                        {currentUser.githubUsername}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Articles Feed</span>
          </button>
          <button
            onClick={() => { setActiveTab('editor'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            <PenTool className="w-4 h-4 text-cyan-400" />
            <span>Markdown Editor</span>
          </button>
          <button
            onClick={() => { setActiveTab('portfolio'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>Live Portfolio</span>
          </button>

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-mono text-cyan-400">@{currentUser.username}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
