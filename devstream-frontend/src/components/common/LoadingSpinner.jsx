import React from 'react';
import { Code2, Sparkles } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 animate-spin flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Code2 className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-bold tracking-wide text-slate-200 font-mono">
          Loading DevStream Module...
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Fetching async bundle & initializing workspace
        </div>
      </div>
    </div>
  );
};
