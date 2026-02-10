import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (username: string, password: string) =>
    api.post('/signup', { username, password }),

  signin: (username: string, password: string) =>
    api.post('/signin', { username, password }),
};

export const contentAPI = {
  getAll: () => api.get('/content'),

  add: (data: { type: string; link: string; title: string; tags: string[]; collectionId?: string }) =>
    api.post('/content', data),

  preview: (url: string, type?: string) =>
    api.get('/content/preview', { params: { url, type } }),

  importItems: (items: Array<{
    type?: string;
    link: string;
    title?: string;
    tags?: string[] | string;
    collectionName?: string;
    collectionId?: string;
  }>) => api.post('/content/import', { items }),

  delete: (contentId: string) => api.delete('/content', { data: { contentId } }),

  aiSuggest: (data: {
    title?: string;
    description?: string;
    link?: string;
    type?: string;
    text?: string;
  }) => api.post('/content/ai/suggest', data),

  semanticSearch: (query: string, limit = 20) =>
    api.get('/content/ai/search', { params: { query, limit } }),

  chat: (question: string) => api.post('/content/ai/chat', { question }),
};

export const collectionAPI = {
  getAll: () => api.get('/collections'),

  create: (name: string) => api.post('/collections', { name }),

  update: (collectionId: string, name: string) =>
    api.patch(`/collections/${collectionId}`, { name }),

  delete: (collectionId: string) => api.delete(`/collections/${collectionId}`),
};

export const brainAPI = {
  createShareLink: () => api.post('/brain/share', { share: true }),

  disableSharing: () => api.post('/brain/share', { share: false }),

  getSharedBrain: (shareLink: string) =>
    axios.get(`${API_BASE_URL}/brain/${shareLink}`),
};

export default api;
