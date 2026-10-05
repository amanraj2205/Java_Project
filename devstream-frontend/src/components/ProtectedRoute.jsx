import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, hasAnyRole, isGuest, getRedirectPath, roles } = useAuth();
  const location = useLocation();

  // If user is not authenticated and the route requires specific roles (not guest)
  if (!isAuthenticated && !allowedRoles.includes('ROLE_GUEST')) {
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  // If allowedRoles is specified, ensure user has at least one of the roles
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/30 bg-slate-900/90 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied (403 Forbidden)</h2>
          <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
            Your account role (<span className="text-cyan-400">{roles.join(', ')}</span>) does not have authorization to view this section.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <a
              href={getRedirectPath()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Go to Your Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
