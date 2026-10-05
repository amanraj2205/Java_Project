import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '../services/api';

const parseGithubUsername = (input) => {
  if (!input) return '';
  let str = input.trim();
  if (str.includes('github.com/')) {
    str = str.split('github.com/')[1];
  }
  str = str.split('/')[0].split('?')[0].replace(/^@/, '').trim();
  return str;
};

export const fetchGithubTop4Repos = async (urlOrUsername) => {
  const username = parseGithubUsername(urlOrUsername);
  if (!username) return [];

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=15`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      const sorted = [...data].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
      return sorted.slice(0, 4).map((r, i) => ({
        id: r.id || `repo-${i}`,
        name: r.name,
        stars: r.stargazers_count || 0,
        language: r.language || 'Code',
        description: r.description || 'Public GitHub Repository',
        htmlUrl: r.html_url
      }));
    }
  } catch (err) {
    console.warn('GitHub API fetch failed:', err);
  }
  return [];
};

export const useGithubRepos = (githubUrlOrUsername) => {
  const username = parseGithubUsername(githubUrlOrUsername);
  return useQuery({
    queryKey: ['githubRepos', username],
    queryFn: () => fetchGithubTop4Repos(username),
    enabled: Boolean(username),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useDeveloperPortfolio = (username) => {
  return useQuery({
    queryKey: ['portfolio', username],
    queryFn: async () => {
      if (!username) return null;
      try {
        const data = await portfolioService.getDeveloperPortfolio(username);
        if (data) return data;
      } catch (err) {
        console.warn(`Portfolio backend fetch failed for user "${username}":`, err.message);
      }
      return null;
    },
    enabled: Boolean(username),
    staleTime: 5 * 60 * 1000,
  });
};
