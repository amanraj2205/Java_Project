import axios from 'axios';

// Backend runs on port 8080, AI Microservice on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000/api/v1/ai';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devstream_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Session expired or unauthorized request. Redirecting to login.');
    }
    return Promise.reject(error);
  }
);

// 1. Identity & Auth Service
export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', {
      usernameOrEmail: username,
      username,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
};

// 2. Content / Articles Service
export const articleService = {
  getAllArticles: async () => {
    const response = await apiClient.get('/articles');
    return response.data;
  },

  getArticleBySlug: async (slug) => {
    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  },

  getArticlesByTag: async (tag) => {
    const response = await apiClient.get(`/articles/tag/${tag}`);
    return response.data;
  },

  getArticlesByAuthor: async (username) => {
    const response = await apiClient.get(`/articles/author/${username}`);
    return response.data;
  },

  createArticle: async (articleData) => {
    const response = await apiClient.post('/articles', articleData);
    return response.data;
  },

  updateArticle: async (slug, articleData) => {
    const response = await apiClient.put(`/articles/${slug}`, articleData);
    return response.data;
  },

  deleteArticle: async (slug) => {
    const response = await apiClient.delete(`/articles/${slug}`);
    return response.data;
  },
};

// 3. Aggregator / Developer Portfolio Service
export const portfolioService = {
  getDeveloperPortfolio: async (username) => {
    const response = await apiClient.get(`/portfolio/${username}`);
    return response.data;
  },
};

// 4. AI Microservice Client (Direct or Fallback)
export const aiService = {
  summarize: async (contentMarkdown, maxLength = 150) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/summarize`, {
        content_markdown: contentMarkdown,
        max_length: maxLength,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      });
      return response.data;
    } catch (err) {
      console.warn('FastAPI microservice unreachable, falling back to client heuristic summary:', err.message);
      // Clean fallback if AI service is starting or offline
      const cleanText = contentMarkdown.replace(/[#*`_~\[\]]/g, '').trim();
      const sentences = cleanText.split(/[.?!]\s+/).filter(Boolean);
      const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 0 ? '.' : '');
      const words = contentMarkdown.trim().split(/\s+/).length;
      return {
        summary: summary || 'A technical overview covering software development patterns and best practices.',
        bullet_points: ['Key technical implementation', 'Architecture decisions and trade-offs'],
        estimated_read_time_minutes: Math.max(1, Math.ceil(words / 200)),
      };
    }
  },

  autoTag: async (contentMarkdown, title = '') => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/auto-tag`, {
        content_markdown: contentMarkdown,
        title: title,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      });
      return response.data;
    } catch (err) {
      console.warn('FastAPI microservice unreachable, extracting tags heuristically:', err.message);
      const keywords = ['java', 'spring', 'python', 'fastapi', 'react', 'mongodb', 'postgres', 'docker', 'jwt', 'api', 'architecture', 'vite', 'tailwind'];
      const text = `${title} ${contentMarkdown}`.toLowerCase();
      const detected = keywords.filter((k) => text.includes(k));
      return {
        tags: detected.length > 0 ? detected.slice(0, 5) : ['engineering', 'webdev'],
      };
    }
  },
};
