import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Shield
} from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { currentUser, isAuthenticated, logout, isModerator } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handlePortfolioClick = () => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
    } else if (currentUser?.username) {
      navigate(`/portfolio/${currentUser.username}`);
    } else {
      navigate('/portfolio/alex_dev');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/feed')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  DevStream
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                stream://developer.hub
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 font-medium text-sm">
            
            {/* Moderator Dashboard */}
            {isAuthenticated && isModerator && (
              <NavLink
                to="/moderator"
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-cyan-400 after:rounded-full after:shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}

            {/* Content Feed Tab */}
            <NavLink
              to="/feed"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive || location.pathname === '/'
                    ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-cyan-400 after:rounded-full after:shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`
              }
            >
              Content
            </NavLink>

            {/* Markdown Editor Tab */}
            <NavLink
              to="/editor"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isActive || location.pathname.startsWith('/editor')
                    ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-cyan-400 after:rounded-full after:shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`
              }
            >
              Editor
            </NavLink>

            {/* Live Portfolio Tab */}
            <button
              type="button"
              onClick={handlePortfolioClick}
              className={`relative px-4 py-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                location.pathname.startsWith('/portfolio')
                  ? 'text-cyan-300 font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-cyan-400 after:rounded-full after:shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              Users & Portfolio
            </button>
          </div>

          {/* Desktop Right User Section */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-pulse" />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={handlePortfolioClick}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0d1424] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md">
                    {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      {currentUser?.username ? `@${currentUser.username}` : 'User'}
                    </span>
                    {isModerator && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                        MOD
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-400"
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
            type="button"
            onClick={() => { navigate('/feed'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Articles Feed</span>
          </button>
          <button
            type="button"
            onClick={() => { navigate('/editor'); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-900"
          >
            <PenTool className="w-4 h-4 text-cyan-400" />
            <span>Markdown Editor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handlePortfolioClick();
            }}
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
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
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
