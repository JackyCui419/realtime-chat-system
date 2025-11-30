<template>
  <div class="profile-page">
    <div class="profile-card" v-if="userId">
      <h2 class="title">My Profile</h2>
      <p class="subtitle">可以在这里更新你的个人资料</p >

      <div class="field">
        <label>用户名（不可修改）</label>
        <div class="readonly-box">{{ username }}</div>
      </div>

      <div class="field">
        <label>姓名（Text）</label>
        <input
          v-model="fullName"
          type="text"
          placeholder="请输入姓名"
        />
      </div>

      <div class="field">
        <label>年龄（Number）</label>
        <input
          v-model="age"
          type="number"
          min="0"
          placeholder="请输入年龄"
        />
      </div>

      <div class="field">
        <label>头像（Image）</label>
        <div class="avatar-row">
          <div class="avatar-preview">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="avatar"
            />
            <div v-else class="avatar-placeholder">无</div>
          </div>
          <input type="file" accept="image/*" @change="onAvatarChange" />
        </div>
        <small class="hint">上传一张图片作为头像，即满足“image”字段要求</small>
      </div>

      <p v-if="error" class="error">{{ error }}</p >
      <p v-if="success" class="success">{{ success }}</p >

      <div class="actions">
        <button :disabled="loading" @click="saveProfile">
          {{ loading ? '保存中…' : '保存资料' }}
        </button>
        <button class="secondary" @click="goChat">
          返回聊天
        </button>
      </div>
    </div>

    <div v-else class="no-user">
      <p>你还没有登录，请先返回登录页面。</p >
      <button @click="goChat">去登录 / 聊天</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '../stores/chat';
import { getProfile, updateProfile } from '../services/profile';

const router = useRouter();
const chatStore = useChatStore();

const userId = computed(() => chatStore.userId);
const username = computed(() => chatStore.username);

const fullName = ref('');
const age = ref('');
const avatarPreview = ref('');
const avatarFile = ref(null);

const loading = ref(false);
const error = ref('');
const success = ref('');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

onMounted(async () => {
  if (!userId.value) return;

  loading.value = true;
  error.value = '';
  try {
    const profile = await getProfile(userId.value);
    fullName.value = profile.full_name || '';
    age.value = profile.age != null ? String(profile.age) : '';
    if (profile.avatar_path) {
      avatarPreview.value = `${API_BASE_URL}${profile.avatar_path}`;
    }
  } catch (err) {
    // 没有资料也没关系，说明是第一次设置
    console.warn('getProfile error:', err.message);
  } finally {
    loading.value = false;
  }
});

const onAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const saveProfile = async () => {
  if (!userId.value) {
    error.value = '请先登录。';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    const profile = await updateProfile(userId.value, {
      fullName: fullName.value,
      age: age.value,
      avatarFile: avatarFile.value
    });

    fullName.value = profile.full_name || '';
    age.value = profile.age != null ? String(profile.age) : '';
    if (profile.avatar_path) {
      avatarPreview.value = `${API_BASE_URL}${profile.avatar_path}`;
    }
    success.value = '资料已保存。';
  } catch (err) {
    console.error(err);
    error.value = err.message || '保存失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

const goChat = () => {
  router.push('/chat');
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #edf2f7;
  padding: 24px;
}

.profile-card {
  width: 420px;
  padding: 24px 24px 20px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #2d3748;
}

.subtitle {
  font-size: 13px;
  color: #718096;
  margin-bottom: 16px;
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 4px;
}

.field input[type='text'],
.field input[type='number'] {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  font-size: 14px;
}

.readonly-box {
  padding: 8px 10px;
  border-radius: 8px;
  background: #edf2f7;
  font-size: 14px;
  color: #2d3748;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #cbd5e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 12px;
  color: #a0aec0;
}

.hint {
  font-size: 11px;
  color: #a0aec0;
}

.error {
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
}

.success {
  color: #38a169;
  font-size: 13px;
  margin-top: 4px;
}

.actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}

.actions button {
  flex: 1;
  padding: 8px 0;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.actions button:first-child {
  background: #3182ce;
  color: #fff;
}

.actions button.secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.no-user {
  text-align: center;
}
</style>