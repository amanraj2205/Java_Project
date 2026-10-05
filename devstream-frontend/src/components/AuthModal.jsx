import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Lock, User, Mail, Github, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedRole, setSelectedRole] = useState('ROLE_STUDENT_AUTHOR');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLoginTab) {
      if (!username.trim() || !password) {
        setError('Please enter both username and password.');
        toast.error('Please enter both username and password.');
        return;
      }
      const res = await login(username, password);
      if (res.success) {
        toast.success(`Welcome back, @${res.user.username}!`);
        onClose();
        if (onAuthSuccess) onAuthSuccess(res.user);
        navigate(res.redirectPath || '/feed');
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    } else {
      if (!username.trim() || !email.trim() || !password) {
        setError('Username, email, and password are required.');
        toast.error('Username, email, and password are required.');
        return;
      }
      const res = await register({
        username,
        email,
        password,
        githubUsername: githubUsername.trim() || null,
        bio: bio.trim() || null,
        role: selectedRole,
      });
      if (res.success) {
        toast.success(`Registered account as @${res.user.username}!`);
        onClose();
        if (onAuthSuccess) onAuthSuccess(res.user);
        navigate(res.redirectPath || '/feed');
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    }
  };

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'student') {
      setUsername('alex_dev');
      setPassword('password123');
      toast.info('Filled student demo credentials');
    } else if (type === 'moderator') {
      setUsername('moderator');
      setPassword('password123');
      toast.info('Filled moderator demo credentials');
    } else if (type === 'new-student') {
      setIsLoginTab(false);
      setUsername('aryan_student');
      setEmail('aryan@aryacollege.in');
      setPassword('password123');
      setGithubUsername('aryan-arya');
      setBio('Student Author at Arya College of Engineering and IT.');
      toast.info('Filled new student author registration template');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 sm:p-8 bg-slate-900/90 border border-slate-700/80 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-white tracking-tight">
            {isLoginTab ? 'DevStream Access' : 'Register Student Author'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {isLoginTab ? 'Role-Based Authentication (JWT)' : 'Create verified author profile'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); }}
            className={`flex-1 pb-3 text-xs font-mono font-bold border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isLoginTab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); }}
            className={`flex-1 pb-3 text-xs font-mono font-bold border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              !isLoginTab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Register Student
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Pre-fill Bar */}
        <div className="mb-6 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Demo:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Author
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('moderator')}
              className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Moderator
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alex_dev"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@devstream.io"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
          </div>

          {!isLoginTab && (
            <>
              <div>
                <label className="block text-slate-300 mb-1">GitHub Handle (Optional)</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="octocat"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Account Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <option value="ROLE_STUDENT_AUTHOR">ROLE_STUDENT_AUTHOR (Technical Writer)</option>
                  <option value="ROLE_MODERATOR">ROLE_MODERATOR (Platform Admin)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>{loading ? 'Processing...' : isLoginTab ? 'Sign In to DevStream' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
