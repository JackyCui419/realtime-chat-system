import { getApiBaseUrl, getMissingBackendMessage } from './config';

export async function uploadChatMedia(file, type = 'image') {
  const base = getApiBaseUrl();
  if (!base) {
    console.warn(getMissingBackendMessage());
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type); // image / audio / sticker

  const res = await fetch(`${base}/api/upload/chat-media`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Upload failed');
  }
  return `${base}${data.url}`; // 例如 http://localhost:3000/uploads/xxxx.png
}
