import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User, Mail, Github, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const { login, register, loading } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLoginTab) {
      if (!username.trim() || !password) {
        setError('Please enter both username and password.');
        return;
      }
      const res = await login(username, password);
      if (res.success) {
        setSuccessMsg(`Welcome back, @${res.user.username}!`);
        setTimeout(() => {
          onClose();
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 800);
      } else {
        setError(res.error);
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setError('Username, email, and password are required.');
        return;
      }
      const res = await register({
        username,
        email,
        password,
        githubUsername: githubUsername.trim() || null,
        bio: bio.trim() || null,
      });
      if (res.success) {
        setSuccessMsg('Account registered successfully! JWT generated.');
        setTimeout(() => {
          onClose();
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 800);
      } else {
        setError(res.error);
      }
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'login') {
      setUsername('alex_dev');
      setPassword('password123');
    } else {
      setUsername('sarah_cloud');
      setEmail('sarah@devstream.io');
      setPassword('password123');
      setGithubUsername('sarahcloud');
      setBio('Full-stack engineer passionate about cloud architecture & distributed systems.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 bg-slate-900/90 border border-slate-700/80 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLoginTab ? 'Developer Access' : 'Create DevStream Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {isLoginTab ? 'Sign in with your JWT credentials' : 'Join the developer-first blogging stream'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-slate-950/80 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isLoginTab ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In (JWT)
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isLoginTab ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_dev"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm glass-input"
              />
            </div>
          </div>

          {/* Email (Register only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@devstream.io"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm glass-input"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm glass-input"
              />
            </div>
          </div>

          {/* GitHub Username (Register only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                GitHub Handle <span className="text-slate-500">(For Live Portfolio Aggregator)</span>
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. torvalds"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm glass-input"
                />
              </div>
            </div>
          )}

          {/* Bio (Register only) */}
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Bio / Tech Stack</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <textarea
                  rows="2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Senior Backend Engineer building high-throughput event-driven microservices..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm glass-input resize-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                <span>{isLoginTab ? 'Authenticate Session' : 'Create Developer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Testing demo?</span>
          <button
            type="button"
            onClick={() => handleFillDemo(isLoginTab ? 'login' : 'register')}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fill Demo {isLoginTab ? 'Credentials' : 'User'}
          </button>
        </div>

      </div>
    </div>
  );
};
