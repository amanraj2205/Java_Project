import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { articleService, aiService } from '../services/api';
import { 
  Sparkles, 
  Send, 
  Save, 
  Eye, 
  Edit3, 
  Columns, 
  Tag as TagIcon, 
  X, 
  Clock, 
  FileCode, 
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Table as TableIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SAMPLE_MARKDOWN = `# Building Resilient Microservices with Spring Boot & MongoDB

In modern cloud architecture, combining relational consistency with distributed document flexibility offers powerful advantages for developer-centric applications.

## Key Architectural Principles

1. **Domain-Driven Grouping**: Avoiding generic package-by-layer structures keeps domain boundaries clean and resilient.
2. **Stateless JWT Security**: Enables seamless horizontal scaling across API gateway clusters.
3. **Hybrid Persistence**:
   - **PostgreSQL** guarantees ACID compliance for critical identity models.
   - **MongoDB** provides dynamic schema capability for rich technical articles.

\`\`\`java
@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @PostMapping
    public ResponseEntity<ArticleResponse> publish(@Valid @RequestBody ArticleCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(articleService.createArticle(req));
    }
}
\`\`\`

> *"Architecture is about the important stuff. Whatever that is."* — Ralph Johnson
`;

export const MarkdownEditor = ({ onArticleCreated, onOpenAuth }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const textareaRef = useRef(null);

  const [title, setTitle] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState(SAMPLE_MARKDOWN);
  const [summary, setSummary] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['springboot', 'mongodb', 'architecture', 'java']);
  const [status, setStatus] = useState('PUBLISHED'); // DRAFT or PUBLISHED

  // Layout view: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState('split');

  // Loading & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [isAiTagging, setIsAiTagging] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Calculations
  const wordCount = contentMarkdown.trim() ? contentMarkdown.trim().split(/\s+/).length : 0;
  const charCount = contentMarkdown.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Tag management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (trimmed && !tags.includes(trimmed) && tags.length < 7) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // AI Microservice: Auto-Tagging
  const handleAiAutoTag = async () => {
    if (!contentMarkdown.trim()) {
      setFeedback({ type: 'error', message: 'Please add some Markdown content before running AI tagging.' });
      return;
    }
    setIsAiTagging(true);
    setFeedback(null);
    try {
      const data = await aiService.autoTag(contentMarkdown, title);
      if (data && data.tags && data.tags.length > 0) {
        const combined = Array.from(new Set([...tags, ...data.tags])).slice(0, 7);
        setTags(combined);
        setFeedback({ type: 'success', message: `AI Tagging generated ${data.tags.length} technical tags!` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to extract AI tags. Check AI microservice.' });
    } finally {
      setIsAiTagging(false);
    }
  };

  // AI Microservice: Summarization
  const handleAiSummarize = async () => {
    if (!contentMarkdown.trim()) {
      setFeedback({ type: 'error', message: 'Please add content before requesting an AI summary.' });
      return;
    }
    setIsAiSummarizing(true);
    setFeedback(null);
    try {
      const data = await aiService.summarize(contentMarkdown, 150);
      if (data && data.summary) {
        setSummary(data.summary);
        setFeedback({ type: 'success', message: `AI summary synthesized (${data.estimated_read_time_minutes || estimatedReadTime} min read)!` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to generate AI summary.' });
    } finally {
      setIsAiSummarizing(false);
    }
  };

  // Markdown Toolbar helper to insert markdown syntax
  const insertSyntax = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousContent = textarea.value;
    const selectedText = previousContent.substring(start, end) || 'text';

    const newContent = 
      previousContent.substring(0, start) + 
      before + selectedText + after + 
      previousContent.substring(end);

    setContentMarkdown(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  // Publish / Save Article
  const handleSaveArticle = async (selectedStatus) => {
    if (!isAuthenticated) {
      setFeedback({ type: 'error', message: 'You must be signed in with a valid JWT token to publish articles.' });
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!title.trim() || title.length < 5) {
      setFeedback({ type: 'error', message: 'Title must be at least 5 characters long.' });
      return;
    }

    if (!contentMarkdown.trim()) {
      setFeedback({ type: 'error', message: 'Article content cannot be empty.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        title: title.trim(),
        contentMarkdown: contentMarkdown,
        summary: summary.trim() || contentMarkdown.substring(0, 160) + '...',
        tags: tags.length > 0 ? tags : ['general'],
        status: selectedStatus || status,
      };

      const created = await articleService.createArticle(payload);
      setFeedback({ 
        type: 'success', 
        message: `Article "${created.title}" successfully ${selectedStatus === 'PUBLISHED' ? 'published' : 'saved as draft'}!` 
      });

      // Clear or reset fields
      setTitle('');
      setSummary('');
      setTags(['springboot', 'react']);
      if (onArticleCreated) onArticleCreated(created);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save article to backend.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Editor Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Edit3 className="w-6 h-6" />
              </span>
              Markdown Authoring Studio
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-slate-900 border border-slate-700 text-slate-300">
              {status}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 font-mono">
            Full-featured Markdown editor with live preview, AI auto-tagging & LangChain summarization
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Mode Switchers */}
          <div className="flex rounded-lg bg-slate-900/90 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('editor')}
              title="Editor Only"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'editor' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split View"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'split' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              title="Preview Only"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'preview' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Save Draft */}
          <button
            onClick={() => handleSaveArticle('DRAFT')}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => handleSaveArticle('PUBLISHED')}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Publishing...
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Publish Article</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-3 text-sm">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metadata Form: Title, Summary, Tags, AI Triggers */}
      <div className="glass-panel p-5 rounded-2xl mb-6 space-y-4">
        
        {/* Title Input */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Article Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Consensus in Modern Microservice Architectures"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-base font-semibold text-white placeholder-slate-600"
          />
        </div>

        {/* AI Triggers Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          {/* Tags section */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-cyan-400" />
                Technical Tags ({tags.length}/7)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Press Enter or Comma</span>
            </label>
            
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 min-h-[44px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/80 border border-cyan-500/30 text-cyan-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {tags.length < 7 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "Add tags (e.g. react, springboot)..." : "Add tag..."}
                  className="bg-transparent text-xs text-slate-200 outline-none placeholder-slate-500 px-1 py-0.5 flex-1 min-w-[100px]"
                />
              )}
            </div>
          </div>

          {/* AI Buttons Cluster */}
          <div className="flex items-end gap-2.5">
            {/* AI Auto-Tag */}
            <button
              type="button"
              onClick={handleAiAutoTag}
              disabled={isAiTagging}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isAiTagging ? 'animate-spin' : ''}`} />
              <span>{isAiTagging ? 'Tagging...' : 'AI Auto-Tag'}</span>
            </button>

            {/* AI Summarize */}
            <button
              type="button"
              onClick={handleAiSummarize}
              disabled={isAiSummarizing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${isAiSummarizing ? 'animate-spin' : ''}`} />
              <span>{isAiSummarizing ? 'Synthesizing...' : 'AI Summarize'}</span>
            </button>
          </div>

        </div>

        {/* Summary Input */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Executive Summary</span>
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-generated via LangChain microservice or custom
            </span>
          </label>
          <textarea
            rows="2"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A concise summary of the article's core technical takeaways..."
            className="w-full px-4 py-2 rounded-xl glass-input text-xs text-slate-300 placeholder-slate-600 resize-none"
          />
        </div>

      </div>

      {/* Markdown Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 mb-3 shadow-md">
        <button
          type="button"
          onClick={() => insertSyntax('# ')}
          title="Heading 1"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('## ')}
          title="Heading 2"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <span className="w-px h-4 bg-slate-700 mx-1"></span>
        <button
          type="button"
          onClick={() => insertSyntax('**', '**')}
          title="Bold"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('*', '*')}
          title="Italic"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('`', '`')}
          title="Inline Code"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('```java\n', '\n```')}
          title="Code Block"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <FileCode className="w-4 h-4" />
        </button>
        <span className="w-px h-4 bg-slate-700 mx-1"></span>
        <button
          type="button"
          onClick={() => insertSyntax('- ')}
          title="Bullet List"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('1. ')}
          title="Numbered List"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('> ')}
          title="Blockquote"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('[', '](https://example.com)')}
          title="Link"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertSyntax('| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |\n')}
          title="Table"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {/* Read Stats */}
        <div className="ml-auto flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {estimatedReadTime} min read
          </span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[650px]">
        
        {/* Left Pane: Markdown Source */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`h-full flex flex-col glass-panel rounded-2xl overflow-hidden ${
            viewMode === 'editor' ? 'lg:col-span-2' : ''
          }`}>
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                MARKDOWN SOURCE (RAW)
              </span>
              <span className="text-[11px] font-mono text-slate-500">UTF-8</span>
            </div>
            <textarea
              ref={textareaRef}
              value={contentMarkdown}
              onChange={(e) => setContentMarkdown(e.target.value)}
              placeholder="Write your developer post in Markdown..."
              className="flex-1 w-full p-4 bg-slate-950/70 text-slate-200 font-mono text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        )}

        {/* Right Pane: Live Rendered Output */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`h-full flex flex-col glass-panel rounded-2xl overflow-hidden ${
            viewMode === 'preview' ? 'lg:col-span-2' : ''
          }`}>
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                LIVE RENDERED PREVIEW
              </span>
              <span className="text-[11px] font-mono text-slate-500">ReactMarkdown Active</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40 markdown-preview">
              {title && (
                <h1 className="text-2xl font-black text-white mb-2">
                  {title}
                </h1>
              )}
              {summary && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs font-sans mb-4 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-400 block mb-1">
                    AI Summary
                  </span>
                  {summary}
                </div>
              )}
              <ReactMarkdown>{contentMarkdown}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
