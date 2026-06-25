import { getApiBaseUrl } from './config';

const DEMO_PROFILES_KEY = 'chat_demo_profiles';

function readDemoProfiles() {
  return JSON.parse(localStorage.getItem(DEMO_PROFILES_KEY) || '{}');
}

function writeDemoProfiles(profiles) {
  localStorage.setItem(DEMO_PROFILES_KEY, JSON.stringify(profiles));
}

function getDemoProfile(userId) {
  const profiles = readDemoProfiles();
  return profiles[userId] || {
    user_id: userId,
    username: '',
    full_name: '',
    age: null,
    avatar_path: ''
  };
}

function handleResponse(resp, data) {
  if (!resp.ok || data.success === false) {
    const message = data?.message || `Request failed with status ${resp.status}`;
    throw new Error(message);
  }
  return data;
}

export async function getProfile(userId) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return getDemoProfile(userId);
  }

  const resp = await fetch(`${apiBaseUrl}/api/profile/${encodeURIComponent(userId)}`);
  const data = await resp.json().catch(() => ({}));
  const result = handleResponse(resp, data);
  return result.profile;
}

export async function updateProfile(userId, { fullName, age, avatarFile }) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    const profiles = readDemoProfiles();
    const existing = getDemoProfile(userId);
    const avatarPath = avatarFile ? URL.createObjectURL(avatarFile) : existing.avatar_path;

    profiles[userId] = {
      ...existing,
      full_name: fullName || '',
      age: age ? Number(age) : null,
      avatar_path: avatarPath
    };
    writeDemoProfiles(profiles);
    return profiles[userId];
  }

  const formData = new FormData();
  if (fullName !== undefined) formData.append('fullName', fullName);
  if (age !== undefined) formData.append('age', age);
  if (avatarFile) formData.append('avatar', avatarFile);

  const resp = await fetch(
    `${apiBaseUrl}/api/profile/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await resp.json().catch(() => ({}));
  const result = handleResponse(resp, data);
  return result.profile;
}
