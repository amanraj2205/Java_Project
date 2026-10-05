import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';
import { articleService, aiService, mediaService } from '../services/api';
import { EditorHeader } from './editor/EditorHeader';
import { EditorToolbar } from './editor/EditorToolbar';
import { AiAssistantSidebar } from './editor/AiAssistantSidebar';
import { MathModal } from './editor/MathModal';
import { ImageUploadModal } from './editor/ImageUploadModal';

import {
  Tag as TagIcon,
  X,
  Edit3,
  Eye,
  ImageIcon,
  Upload,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Check
} from 'lucide-react';
import 'katex/dist/katex.min.css';

const lowlight = createLowlight(common);

const DEFAULT_GfG_HTML = `
<h1>Building High-Performance Java & Spring Boot Microservices</h1>
<p>Welcome to <strong>DevStream</strong>'s GfG-style technical writing workspace. This editor supports full <em>rich text formatting</em>, <code>inline code</code>, syntax-highlighted code blocks, math equations, and Cloudinary CDN image uploads.</p>

<h2>1. Core Microservice Architecture</h2>
<p>Domain-Driven Design (DDD) separates the identity layer (PostgreSQL) from the content persistence layer (MongoDB Atlas).</p>

<pre><code class="language-java">@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT_AUTHOR')")
    public ResponseEntity&lt;ArticleResponse&gt; createArticle(@Valid @RequestBody ArticleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(articleService.createArticle(request));
    }
}</code></pre>

<h2>2. Mathematical Complexity & Algorithm Analysis</h2>
<p>Time complexity of our multi-index query lookup is bounded by:</p>
<p><code>O(\log N + K)</code> where <em>N</em> represents total MongoDB documents and <em>K</em> is page count.</p>
`;

export const MarkdownEditor = ({ initialDraft, onArticleCreated, onOpenAuth }) => {
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState(initialDraft?.title || '');
  const [summary, setSummary] = useState(initialDraft?.summary || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialDraft?.coverImageUrl || initialDraft?.imageUrl || '');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialDraft?.tags || ['springboot', 'mongodb', 'java', 'architecture']);
  const [status, setStatus] = useState(initialDraft?.status || 'PUBLISHED');

  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [mathModalOpen, setMathModalOpen] = useState(false);
  const [mathInput, setMathInput] = useState('E = mc^2');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Auto-save local draft state tracking
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState(null);
  const [lastSavedAgo, setLastSavedAgo] = useState('');
  const [hasDraftToRestore, setHasDraftToRestore] = useState(false);

  // Initialize TipTap WYSIWYG Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: initialDraft?.contentHtml || DEFAULT_GfG_HTML,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[420px] text-slate-200 text-sm leading-relaxed p-4',
      },
    },
  });

  // Check for unsaved local backup on load
  useEffect(() => {
    if (!initialDraft && editor) {
      const savedBackup = localStorage.getItem('devstream_draft_backup');
      if (savedBackup) {
        try {
          const parsed = JSON.parse(savedBackup);
          if (parsed.title || parsed.contentHtml) {
            setHasDraftToRestore(true);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [initialDraft, editor]);

  // Handle local draft restoration
  const handleRestoreDraft = () => {
    try {
      const savedBackup = localStorage.getItem('devstream_draft_backup');
      if (savedBackup) {
        const parsed = JSON.parse(savedBackup);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.coverImageUrl) setCoverImageUrl(parsed.coverImageUrl);
        if (parsed.tags && parsed.tags.length > 0) setTags(parsed.tags);
        if (parsed.contentHtml && editor) editor.commands.setContent(parsed.contentHtml);
        toast.success('Restored local draft backup!');
      }
    } catch {
      toast.error('Failed to restore draft backup');
    } finally {
      setHasDraftToRestore(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('devstream_draft_backup');
    setHasDraftToRestore(false);
    toast.info('Discarded local draft backup');
  };

  // Local Autosave Hook (every 10 seconds or buffer change)
  useEffect(() => {
    if (!editor) return;
    const timer = setInterval(() => {
      const draftData = {
        title,
        summary,
        coverImageUrl,
        tags,
        contentHtml: editor.getHTML(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('devstream_draft_backup', JSON.stringify(draftData));
      setLastSavedTimestamp(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, [editor, title, summary, coverImageUrl, tags]);

  // Update "Draft saved locally X ago" status badge text
  useEffect(() => {
    if (!lastSavedTimestamp) return;
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSavedTimestamp) / 1000);
      if (seconds < 5) setLastSavedAgo('just now');
      else if (seconds < 60) setLastSavedAgo(`${seconds}s ago`);
      else setLastSavedAgo(`${Math.floor(seconds / 60)}m ago`);
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTimestamp]);

  // Save / Publish Core Action Handler
  const handlePublishOrSave = useCallback(async (targetStatus = 'PUBLISHED') => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      toast.error('Please sign in to publish your article.');
      return;
    }

    if (!title.trim()) {
      toast.error('Article title is required.');
      return;
    }

    if (!editor || !editor.getText().trim()) {
      toast.error('Article content cannot be empty.');
      return;
    }

    setSaving(true);
    const htmlToSave = DOMPurify.sanitize(editor.getHTML());
    const jsonToSave = JSON.stringify(editor.getJSON());

    const payload = {
      title: title.trim(),
      coverImageUrl: coverImageUrl,
      contentHtml: htmlToSave,
      contentJson: jsonToSave,
      contentMarkdown: editor.getText(),
      summary: summary.trim() || null,
      tags: tags,
      status: targetStatus,
    };

    try {
      let result;
      if (initialDraft?.slug) {
        result = await articleService.updateArticle(initialDraft.slug, payload);
      } else {
        result = await articleService.createArticle(payload);
      }

      // Clear local auto-save backup upon successful publish/save
      localStorage.removeItem('devstream_draft_backup');
      toast.success(`Article successfully ${targetStatus === 'PUBLISHED' ? 'published' : 'saved as draft'}!`);
      
      if (onArticleCreated) {
        onArticleCreated(result);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to persist article.');
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, onOpenAuth, title, editor, coverImageUrl, summary, tags, initialDraft, onArticleCreated]);

  // Keyboard Shortcuts (Ctrl+S / Cmd+S, Ctrl+Enter / Cmd+Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S -> Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlePublishOrSave('DRAFT');
      }
      // Ctrl+Enter or Cmd+Enter -> Publish Article
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlePublishOrSave('PUBLISHED');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePublishOrSave]);

  if (!editor) return null;

  const rawHtml = editor.getHTML();
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  // Word count & Reading time calculations
  const plainText = editor.getText();
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Cloudinary Image Upload Handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    setUploadError('');
    try {
      const res = await mediaService.uploadImage(file, 'articles');
      if (res && res.url) {
        editor.chain().focus().setImage({ src: res.url }).run();
        setImageModalOpen(false);
        setImageUrlInput('');
        toast.success('Image uploaded to Cloudinary CDN!');
      } else {
        setUploadError('Failed to retrieve Cloudinary image URL');
        toast.error('Image upload failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cloudinary upload failed';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  // Cover / Thumbnail File Upload Handler
  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      setCoverImageUrl(dataUrl);

      setUploadingCover(true);
      try {
        const res = await mediaService.uploadImage(file, 'articles');
        if (res?.url) {
          setCoverImageUrl(res.url);
          toast.success('Cover image uploaded to CDN!');
        }
      } catch (err) {
        toast.info('Using image preview');
      } finally {
        setUploadingCover(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addImage = () => {
    if (imageUrlInput.trim()) {
      editor.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
      setImageUrlInput('');
      setImageModalOpen(false);
      toast.success('Image embedded!');
    }
  };

  const addMathEquation = () => {
    if (mathInput.trim()) {
      const mathHtml = `<span class="katex-math font-mono px-2 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800">\\(${mathInput.trim()}\\)</span>`;
      editor.chain().focus().insertContent(` ${mathHtml} `).run();
      setMathInput('');
      setMathModalOpen(false);
      toast.success('LaTeX math equation inserted!');
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // AI Microservice Operations
  const handleAiAutoTag = async () => {
    if (!editor.getText().trim()) {
      toast.error('Write article content first for AI tag detection.');
      return;
    }
    setAiLoading(true);
    setAiMsg('Detecting technical domain tags via FastAPI AI microservice...');
    try {
      const res = await aiService.autoTag(editor.getText(), title);
      if (res.tags && res.tags.length > 0) {
        const merged = Array.from(new Set([...tags, ...res.tags]));
        setTags(merged);
        toast.success(`AI detected ${res.tags.length} technical domain tags!`);
      }
    } catch {
      toast.warning('FastAPI microservice unreachable. Used heuristic fallback.');
    } finally {
      setAiLoading(false);
      setAiMsg('');
    }
  };

  const handleAiSummarize = async () => {
    if (!editor.getText().trim()) {
      toast.error('Write article text before generating summary.');
      return;
    }
    setAiLoading(true);
    setAiMsg('Generating executive abstract via LangChain model...');
    try {
      const res = await aiService.summarize(editor.getText());
      if (res.summary) {
        setSummary(res.summary);
        toast.success('AI summary generated!');
      }
    } catch {
      toast.warning('AI summary failed. Enter summary manually.');
    } finally {
      setAiLoading(false);
      setAiMsg('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Draft Recovery Banner if unsaved local backup exists */}
      {hasDraftToRestore && (
        <div className="p-4 rounded-3xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Unsaved local draft backup found from your previous editing session!</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Check className="w-3.5 h-3.5" /> Restore
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Main Action Controls */}
      <EditorHeader
        initialDraft={initialDraft}
        saving={saving}
        lastSavedAgo={lastSavedAgo}
        onSaveDraft={() => handlePublishOrSave('DRAFT')}
        onPublish={() => handlePublishOrSave('PUBLISHED')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Columns: Article Metadata & Editor Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Article Metadata Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Dive into Spring Security RBAC & JWT Claims"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-base font-bold text-white focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors placeholder:text-slate-600"
              />

              {/* Cover Image Preview */}
              {coverImageUrl && (
                <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl group">
                  <img
                    src={coverImageUrl}
                    alt="Article Cover Thumbnail"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-xl bg-slate-950/80 text-rose-400 hover:text-rose-300 text-xs font-mono border border-slate-800 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Cover
                  </button>
                </div>
              )}
            </div>

            {/* Technical Tags Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Technical Tags</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1 flex-1 min-w-[150px]">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag & hit enter..."
                    className="w-full bg-transparent px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Abstract / Summary */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Executive Summary (2-Sentence Abstract)
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="A concise 2-sentence architectural summary..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 leading-relaxed"
              />
            </div>

            {/* Cover Image Upload Section */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Article Cover / Thumbnail Image</span>
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label
                  htmlFor="editor-cover-file-input"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{uploadingCover ? 'Uploading...' : 'Upload Image'}</span>
                </label>
                <input
                  type="file"
                  id="editor-cover-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileUpload}
                />

                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono"
                />
              </div>
            </div>

          </div>

          {/* Main WYSIWYG Workspace Panel */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modular Rich Formatting Toolbar */}
            <EditorToolbar
              editor={editor}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onOpenMathModal={() => setMathModalOpen(true)}
              onOpenImageModal={() => setImageModalOpen(true)}
              onLaptopFileUpload={handleFileUpload}
            />

            {/* Split / Canvas View */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-950">
              {(viewMode === 'editor' || viewMode === 'split') && (
                <div className={`p-4 bg-slate-950 min-h-[450px] ${viewMode === 'editor' ? 'col-span-2' : ''}`}>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span>Visual Technical Canvas (TipTap WYSIWYG)</span>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`p-6 bg-slate-900/40 min-h-[450px] overflow-y-auto ${viewMode === 'preview' ? 'col-span-2' : ''}`}>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      DOMPurify Sanitized HTML
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">XSS Safe</span>
                  </div>

                  <div
                    className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed wysiwyg-reader"
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right 1 Column: AI Companion Drawer / Sidebar */}
        <div className="lg:col-span-1">
          <AiAssistantSidebar
            wordCount={wordCount}
            estimatedReadTime={estimatedReadTime}
            aiLoading={aiLoading}
            aiMsg={aiMsg}
            onAutoTag={handleAiAutoTag}
            onSummarize={handleAiSummarize}
          />
        </div>

      </div>

      {/* Cloudinary Image Upload Modal */}
      <ImageUploadModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onFileUpload={handleFileUpload}
        uploadingImage={uploadingImage}
        uploadError={uploadError}
        imageUrlInput={imageUrlInput}
        setImageUrlInput={setImageUrlInput}
        onAddImageUrl={addImage}
      />

      {/* LaTeX Math Formula Modal */}
      <MathModal
        isOpen={mathModalOpen}
        onClose={() => setMathModalOpen(false)}
        onSubmit={addMathEquation}
        mathInput={mathInput}
        setMathInput={setMathInput}
      />

    </div>
  );
};
