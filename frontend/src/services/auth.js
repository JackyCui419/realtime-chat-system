import { getApiBaseUrl } from './config';

const DEMO_USERS_KEY = 'chat_demo_users';

function readDemoUsers() {
  return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
}

function writeDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function demoRegister(username, password) {
  const cleanUsername = username.trim();
  const users = readDemoUsers();
  if (users.some((user) => user.username === cleanUsername)) {
    throw new Error('Username already exists in demo mode.');
  }

  const user = {
    userId: `demo_${Date.now()}`,
    username: cleanUsername,
    password
  };
  users.push(user);
  writeDemoUsers(users);

  return {
    success: true,
    userId: user.userId,
    username: user.username,
    demoMode: true
  };
}

function demoLogin(username, password) {
  const cleanUsername = username.trim();
  const user = readDemoUsers().find((item) => item.username === cleanUsername);
  if (!user) {
    throw new Error('Demo user does not exist. Please register first.');
  }
  if (user.password !== password) {
    throw new Error('Incorrect password.');
  }

  return {
    success: true,
    userId: user.userId,
    username: user.username,
    demoMode: true
  };
}

async function request(path, body) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return path === '/api/register'
      ? demoRegister(body.username, body.password)
      : demoLogin(body.username, body.password);
  }

  const resp = await fetch(`${apiBaseUrl}${path}`, {
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
