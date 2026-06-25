const LOCAL_BACKEND_URL = 'http://localhost:3000';

function normalizeUrl(url) {
  return url?.replace(/\/$/, '');
}

function isPublicHttpsUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    if (parsed.protocol !== 'https:') return false;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return false;
    if (host.startsWith('10.') || host.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;

    return true;
  } catch (err) {
    return false;
  }
}

function getProductionSafeUrl(url) {
  const configured = normalizeUrl(url);
  if (!configured) return '';
  if (import.meta.env.DEV) return configured;
  return isPublicHttpsUrl(configured) ? configured : '';
}

export function getApiBaseUrl() {
  const configured = getProductionSafeUrl(import.meta.env.VITE_API_BASE_URL);
  if (configured) return configured;
  return import.meta.env.DEV ? LOCAL_BACKEND_URL : '';
}

export function getSocketUrl() {
  const configured = getProductionSafeUrl(import.meta.env.VITE_SOCKET_URL);
  if (configured) return configured;
  return import.meta.env.DEV ? LOCAL_BACKEND_URL : '';
}

export function getMissingBackendMessage() {
  return '后端服务还没有部署到公网。GitHub Pages 只托管前端页面，登录/注册需要先部署 Node.js 后端和 MySQL。';
}
