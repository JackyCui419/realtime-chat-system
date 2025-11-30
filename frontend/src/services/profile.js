const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function handleResponse(resp, data) {
  if (!resp.ok || data.success === false) {
    const message = data?.message || `Request failed with status ${resp.status}`;
    throw new Error(message);
  }
  return data;
}

export async function getProfile(userId) {
  const resp = await fetch(`${API_BASE_URL}/api/profile/${encodeURIComponent(userId)}`);
  const data = await resp.json().catch(() => ({}));
  const result = handleResponse(resp, data);
  return result.profile;
}

export async function updateProfile(userId, { fullName, age, avatarFile }) {
  const formData = new FormData();
  if (fullName !== undefined) formData.append('fullName', fullName);
  if (age !== undefined) formData.append('age', age);
  if (avatarFile) formData.append('avatar', avatarFile);

  const resp = await fetch(
    `${API_BASE_URL}/api/profile/${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await resp.json().catch(() => ({}));
  const result = handleResponse(resp, data);
  return result.profile;
}