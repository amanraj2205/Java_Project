import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleService } from '../services/api';

const FALLBACK_ARTICLES = [
  {
    id: "art-1",
    title: "Building Resilient Microservices with Spring Boot & MongoDB Atlas",
    slug: "building-resilient-microservices-spring-boot-mongodb",
    summary: "Architecting domain-driven microservice boundaries, stateless JWT authentication, and hybrid data persistence with local PostgreSQL and Mongo Atlas.",
    contentMarkdown: `# Building Resilient Microservices with Spring Boot & MongoDB Atlas\n\nModern cloud backends demand balancing relational integrity for authentication and dynamic document agility for rich text. In DevStream, we leverage Spring Boot 3 with dual repositories.\n\n## Core Tenets\n- Package by Domain (/identity, /content, /aggregator)\n- Stateless JWT Security\n- Asynchronous Multi-Query Aggregation`,
    tags: ["springboot", "mongodb", "architecture", "microservices"],
    authorUsername: "alex_dev",
    viewCount: 6820,
    createdAt: "2026-09-18T10:15:00Z",
    status: "PUBLISHED"
  },
  {
    id: "art-2",
    title: "FastAPI + LangChain: High-Throughput Microservice Patterns for AI",
    slug: "fastapi-langchain-microservice-patterns-production-ai",
    summary: "Deploying asynchronous Python endpoints for automated technical article summarization, zero-shot tagging, and seamless Spring WebClient orchestration.",
    contentMarkdown: `# FastAPI + LangChain: High-Throughput Microservice Patterns for AI\n\nAI pipelines must be isolated from the transactional backend to protect thread pools. DevStream's \`devstream-ai\` microservice wraps LangChain models in FastAPI.\n\n## Endpoints\n- \`POST /api/v1/ai/summarize\`\n- \`POST /api/v1/ai/auto-tag\``,
    tags: ["python", "fastapi", "langchain", "ai"],
    authorUsername: "sarah_cloud",
    viewCount: 4520,
    createdAt: "2026-09-24T14:30:00Z",
    status: "PUBLISHED"
  },
  {
    id: "art-3",
    title: "Vite + Tailwind CSS: Crafting Cyber-Developer Aesthetic UIs",
    slug: "vite-tailwind-crafting-cyber-developer-aesthetic-ui",
    summary: "How to use dark mode, glassmorphism, responsive split-pane editors, and custom scrollbars to build an engaging platform for software engineers.",
    contentMarkdown: `# Vite + Tailwind CSS: Crafting Cyber-Developer Aesthetic UIs\n\nDevelopers spend hours reading code and docs. UI design should treat developers with rich dark themes, high-contrast monospace code blocks, and frictionless authoring.`,
    tags: ["react", "vite", "tailwind", "frontend"],
    authorUsername: "elena_ui",
    viewCount: 3180,
    createdAt: "2026-09-28T16:45:00Z",
    status: "PUBLISHED"
  }
];

export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      try {
        const data = await articleService.getAllArticles();
        if (data && data.length > 0) return data;
        return FALLBACK_ARTICLES;
      } catch (err) {
        console.warn('Backend articles endpoint unreachable, returning fallback demo articles:', err.message);
        return FALLBACK_ARTICLES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: true,
  });
};

export const useArticleBySlug = (slug) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await articleService.getArticleBySlug(slug);
        if (data) return data;
      } catch (err) {
        console.warn(`Article fetch failed for slug "${slug}", searching fallback articles:`, err.message);
      }
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticlesByAuthor = (username) => {
  return useQuery({
    queryKey: ['articles', 'author', username],
    queryFn: async () => {
      if (!username) return [];
      try {
        const data = await articleService.getArticlesByAuthor(username);
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {
        // Try all articles filter
      }
      try {
        const allData = await articleService.getAllArticles();
        if (Array.isArray(allData)) {
          const filtered = allData.filter(a => a.authorUsername && a.authorUsername.toLowerCase() === username.toLowerCase());
          if (filtered.length > 0) return filtered;
        }
      } catch {}
      return FALLBACK_ARTICLES.filter((a) => a.authorUsername.toLowerCase() === username.toLowerCase());
    },
    enabled: Boolean(username),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleData) => articleService.createArticle(articleData),
    onSuccess: (newArticle) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      if (newArticle?.authorUsername) {
        queryClient.invalidateQueries({ queryKey: ['articles', 'author', newArticle.authorUsername] });
      }
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, articleData }) => articleService.updateArticle(slug, articleData),
    onSuccess: (updatedArticle, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', variables.slug] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => articleService.deleteArticle(slug),
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      const previousArticles = queryClient.getQueryData(['articles']);
      queryClient.setQueryData(['articles'], (old) =>
        old ? old.filter((a) => a.slug !== slug) : []
      );
      return { previousArticles };
    },
    onError: (err, slug, context) => {
      if (context?.previousArticles) {
        queryClient.setQueryData(['articles'], context.previousArticles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};
