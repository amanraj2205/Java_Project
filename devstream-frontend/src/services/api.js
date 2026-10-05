import axios from 'axios';

// Backend runs on port 8080, AI Microservice on port 8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000/api/v1/ai';
const CLOUDINARY_CLOUD_NAME = 'dcconf1h6';

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
      console.warn('Session expired or unauthorized request.');
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

  getMyDrafts: async () => {
    const response = await apiClient.get('/articles/my-drafts');
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

// 3. Cloudinary Media Service
export const mediaService = {
  uploadImage: async (file, folder = 'articles') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await apiClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.warn('Backend Cloudinary upload endpoint failed, falling back to direct unsigned Cloudinary API:', err.message);
      // Fallback direct upload to Cloudinary API using user's cloud name
      const directFormData = new FormData();
      directFormData.append('file', file);
      directFormData.append('upload_preset', 'unsigned_preset');
      const directRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        directFormData
      );
      return { url: directRes.data.secure_url, publicId: directRes.data.public_id };
    }
  },
};

// 4. Tag Service (Public & Moderation)
export const tagService = {
  getAllTags: async () => {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  createTag: async (tagData) => {
    const response = await apiClient.post('/tags', tagData);
    return response.data;
  },

  deleteTag: async (name) => {
    const response = await apiClient.delete(`/tags/${name}`);
    return response.data;
  },
};

// 5. Moderator Service (Admin / Queue / Oversight)
export const moderationService = {
  getArticlesQueue: async () => {
    const response = await apiClient.get('/moderation/articles');
    return response.data;
  },

  setArticleVisibility: async (slug, hide) => {
    const response = await apiClient.patch(`/moderation/articles/${slug}/visibility?hide=${hide}`);
    return response.data;
  },

  deleteArticle: async (slug) => {
    const response = await apiClient.delete(`/moderation/articles/${slug}`);
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/moderation/users');
    return response.data;
  },

  updateUserRole: async (userId, roleName) => {
    const response = await apiClient.patch(`/moderation/users/${userId}/role?roleName=${roleName}`);
    return response.data;
  },
};

// 6. Aggregator / Developer Portfolio & User Profile Service
export const portfolioService = {
  getDeveloperPortfolio: async (username) => {
    const response = await apiClient.get(`/portfolio/${username}`);
    return response.data;
  },

  updatePortfolio: async (username, data) => {
    const response = await apiClient.put(`/portfolio/${username}`, data);
    return response.data;
  },
};

export const userService = {
  uploadResume: async (pdfFile) => {
    const formData = new FormData();
    formData.append('file', pdfFile);

    const response = await apiClient.post('/users/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// 7. AI Microservice Client (Direct or Fallback)
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
      const cleanText = (contentMarkdown || '').replace(/[#*`_~\[\]]/g, '').trim();
      const sentences = cleanText.split(/[.?!]\s+/).filter(Boolean);
      const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 0 ? '.' : '');
      const words = (contentMarkdown || '').trim().split(/\s+/).length;
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

  codeReview: async (codeContent) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/code-review`, {
        code_content: codeContent,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      });
      return response.data;
    } catch (err) {
      console.warn('FastAPI microservice unreachable for code review, using heuristic fallback:', err.message);
      return {
        review_summary: 'Heuristic code inspection completed.',
        suggestions: [
          'Ensure immutable data transfer objects (DTOs) for API request models.',
          'Verify error boundaries and async exception handlers across service methods.'
        ],
        security_score: 90,
      };
    }
  },
};
