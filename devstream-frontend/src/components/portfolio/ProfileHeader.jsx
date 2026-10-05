import React from 'react';
import { User, Github, Linkedin, Globe, FileText, MapPin, Edit3, Download, Sparkles, Upload } from 'lucide-react';

const DEFAULT_AVATAR_URL = "./image/avatar.png";

export const ProfileHeader = ({
  portfolio,
  isOwnProfile,
  onOpenEditModal,
  onUploadResume,
  uploadingResume,
}) => {
  return (
    <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Avatar & Bio */}
        <div className="flex flex-col sm:flex-row items-center md:items-start gap-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={portfolio.avatarUrl || DEFAULT_AVATAR_URL}
              alt={portfolio.fullName || portfolio.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/10"
              onError={(e) => { e.target.src = DEFAULT_AVATAR_URL; }}
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
              <User className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {portfolio.fullName || `@${portfolio.username || 'developer'}`}
              </h1>
              {portfolio.username && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  @{portfolio.username}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {portfolio.bio || "Full-stack developer architecting microservices, cloud deployments, and reactive web user interfaces."}
            </p>

            {portfolio.location && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{portfolio.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Social Links */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
          {isOwnProfile && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenEditModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/20 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>

              <label
                htmlFor="profile-resume-input"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="Upload PDF Resume"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{uploadingResume ? 'Uploading...' : 'Upload Resume'}</span>
              </label>
              <input
                type="file"
                id="profile-resume-input"
                accept=".pdf"
                className="hidden"
                onChange={onUploadResume}
              />
            </div>
          )}

          {/* Social Badges */}
          <div className="flex items-center gap-2 pt-2">
            {portfolio.githubUrl && (
              <a
                href={portfolio.githubUrl.startsWith('http') ? portfolio.githubUrl : `https://${portfolio.githubUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {portfolio.linkedinUrl && (
              <a
                href={portfolio.linkedinUrl.startsWith('http') ? portfolio.linkedinUrl : `https://${portfolio.linkedinUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}

            {portfolio.portfolioUrl && (
              <a
                href={portfolio.portfolioUrl.startsWith('http') ? portfolio.portfolioUrl : `https://${portfolio.portfolioUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="Personal Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}

            {portfolio.resumeUrl && (
              <a
                href={portfolio.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-900/50 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                title="Download Resume PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume</span>
                <Download className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Skills Pill Badges */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Core Stack:
          </span>
          {portfolio.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
