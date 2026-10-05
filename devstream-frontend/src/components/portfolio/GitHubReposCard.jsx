import React from 'react';
import { Github, Star, ExternalLink, Code, Pin } from 'lucide-react';

export const GitHubReposCard = ({ repos = [], githubUsername }) => {
  if (!repos || repos.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <Github className="w-5 h-5 text-cyan-400" />
            <span>Pinned GitHub Repositories</span>
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-mono">
          No public GitHub repositories loaded yet. Add a GitHub username or URL to automatically showcase top repositories.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pinned GitHub Repositories</span>
              <Pin className="w-4 h-4 text-cyan-400 rotate-45" />
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Top public repositories sorted by stargazer count
            </p>
          </div>
        </div>

        {githubUsername && (
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>View All on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id || repo.name}
            className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 flex flex-col justify-between group transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <a
                  href={repo.htmlUrl || `https://github.com/${githubUsername}/${repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-sm text-cyan-300 group-hover:text-cyan-400 flex items-center gap-1.5 hover:underline focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Code className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
                  <span>{repo.name}</span>
                </a>

                <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{repo.stars || 0}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {repo.description || 'Public technical repository featuring clean architecture and modular code.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                {repo.language || 'TypeScript'}
              </span>

              <a
                href={repo.htmlUrl || `https://github.com/${githubUsername}/${repo.name}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>Code</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
