import React, { useEffect } from 'react';
import { Cloud, X, Upload, Loader2 } from 'lucide-react';

export const ImageUploadModal = ({
  isOpen,
  onClose,
  onFileUpload,
  uploadingImage,
  uploadError,
  imageUrlInput,
  setImageUrlInput,
  onAddImageUrl,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 id="image-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Cloudinary CDN Image Manager</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {uploadError}
          </div>
        )}

        {/* File Upload Zone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
          <input
            type="file"
            accept="image/*"
            id="cloudinary-file-input"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileUpload(e.target.files[0]);
              }
            }}
          />
          <label htmlFor="cloudinary-file-input" className="cursor-pointer space-y-2 block focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <div className="text-xs font-bold text-slate-200">
              {uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image File (PNG, JPG, WebP)'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Cloud Name: <span className="text-cyan-400 font-bold">dcconf1h6</span>
            </div>
          </label>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-2 text-[10px] font-mono text-slate-500 uppercase">Or Image URL</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <input
          type="url"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddImageUrl();
            }
          }}
          placeholder="https://res.cloudinary.com/..."
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Cancel (Esc)
          </button>
          <button
            type="button"
            onClick={onAddImageUrl}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Embed URL
          </button>
        </div>
      </div>
    </div>
  );
};
