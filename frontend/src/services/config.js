const LOCAL_BACKEND_URL = 'http://localhost:3000';

function normalizeUrl(url) {
  return url?.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  const configured = normalizeUrl(import.meta.env.VITE_API_BASE_URL);
  if (configured) return configured;
  return import.meta.env.DEV ? LOCAL_BACKEND_URL : '';
}

export function getSocketUrl() {
  const configured = normalizeUrl(import.meta.env.VITE_SOCKET_URL);
  if (configured) return configured;
  return import.meta.env.DEV ? LOCAL_BACKEND_URL : '';
}

export function getMissingBackendMessage() {
  return '后端服务还没有部署到公网。GitHub Pages 只托管前端页面，登录/注册需要先部署 Node.js 后端和 MySQL。';
}
