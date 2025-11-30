const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, body) {
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await resp.json();
  } catch (e) {}

  if (!resp.ok || data.success === false) {
    const message = data.message || `Request failed with status ${resp.status}`;
    throw new Error(message);
  }

  return data;
}

export function register(username, password) {
  return request('/api/register', { username, password });
}

export function login(username, password) {
  return request('/api/login', { username, password });
}