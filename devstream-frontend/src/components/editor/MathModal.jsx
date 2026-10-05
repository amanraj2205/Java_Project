import React, { useEffect } from 'react';
import { Sigma, X } from 'lucide-react';

export const MathModal = ({ isOpen, onClose, onSubmit, mathInput, setMathInput }) => {
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
      aria-labelledby="math-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 id="math-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
            <Sigma className="w-4 h-4 text-indigo-400" />
            <span>Insert LaTeX Math Formula</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">
            LaTeX Expression:
          </label>
          <input
            type="text"
            value={mathInput}
            onChange={(e) => setMathInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="e.g. \sum_{i=1}^n x_i"
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-cyan-400"
          />
        </div>

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
            onClick={onSubmit}
            className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Insert Formula
          </button>
        </div>
      </div>
    </div>
  );
};
