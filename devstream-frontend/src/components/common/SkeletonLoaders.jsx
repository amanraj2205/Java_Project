import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 animate-pulse relative overflow-hidden">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-[shimmer_2s_infinite]" />
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-slate-800 rounded-md" />
          <div className="h-5 w-20 bg-slate-800 rounded-md" />
        </div>
        <div className="h-4 w-24 bg-slate-800/80 rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-6 bg-slate-800 rounded-xl w-5/6" />
        <div className="h-4 bg-slate-800/60 rounded-lg w-full" />
        <div className="h-4 bg-slate-800/60 rounded-lg w-3/4" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-12 bg-slate-800 rounded" />
      </div>
    </div>
  );
};

export const SkeletonPortfolio = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Profile Banner Skeleton */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-3xl bg-slate-800" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-8 bg-slate-800 rounded-xl w-48 mx-auto md:mx-0" />
            <div className="h-4 bg-slate-800/80 rounded-lg w-32 mx-auto md:mx-0" />
            <div className="h-4 bg-slate-800/60 rounded-lg w-3/4 mx-auto md:mx-0" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          <div className="h-7 w-20 bg-slate-800 rounded-xl" />
          <div className="h-7 w-24 bg-slate-800 rounded-xl" />
          <div className="h-7 w-16 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Repos Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="h-5 bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-800/60 rounded w-5/6" />
              <div className="h-4 bg-slate-800/40 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
