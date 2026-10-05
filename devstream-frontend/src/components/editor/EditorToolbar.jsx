import React from 'react';
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  FileCode,
  Sigma,
  Upload,
  Cloud,
  List,
  ListOrdered,
  Quote
} from 'lucide-react';

export const EditorToolbar = ({
  editor,
  viewMode,
  setViewMode,
  onOpenMathModal,
  onOpenImageModal,
  onLaptopFileUpload,
}) => {
  if (!editor) return null;

  return (
    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-slate-300 text-xs font-mono">
      <div className="flex items-center flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('bold') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('italic') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('code') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('codeBlock') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
          title="Code Block"
        >
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span>Code Block</span>
        </button>

        <button
          type="button"
          onClick={onOpenMathModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="LaTeX Math Equation"
        >
          <Sigma className="w-4 h-4 text-indigo-400" />
          <span>LaTeX Math</span>
        </button>

        {/* Laptop File Upload Input */}
        <input
          type="file"
          accept="image/*"
          id="toolbar-laptop-image-input"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onLaptopFileUpload(e.target.files[0]);
            }
          }}
        />
        <label
          htmlFor="toolbar-laptop-image-input"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Select & Upload Image File directly from your Laptop / PC"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </label>

        <button
          type="button"
          onClick={onOpenImageModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Insert Image by CDN URL"
        >
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span>Image URL</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('bulletList') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('orderedList') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            editor.isActive('blockquote') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'border-transparent hover:bg-slate-900'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setViewMode('editor')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            viewMode === 'editor' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          WYSIWYG
        </button>
        <button
          type="button"
          onClick={() => setViewMode('split')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            viewMode === 'split' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Split
        </button>
        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            viewMode === 'preview' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Preview
        </button>
      </div>
    </div>
  );
};
