<template>
  <div class="page-root">
    <!-- 登录 / 注册界面 -->
    <div v-if="!isConnected" class="auth-section">
      <div class="auth-card">
        <h1 class="app-title">Group Chat</h1>
        <p class="app-subtitle">请先登录或注册账号，再进入聊天室</p >

        <div class="auth-mode-toggle">
          <button
            type="button"
            class="auth-mode-btn"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            登录
          </button>
          <button
            type="button"
            class="auth-mode-btn"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >
            注册
          </button>
        </div>

        <div class="auth-field">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
          />
        </div>

        <div class="auth-field">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
          />
        </div>

        <div v-if="mode === 'register'" class="auth-field">
          <label>确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </div>

        <p v-if="authError" class="auth-error">
          {{ authError }}
        </p >

        <button
          type="button"
          class="auth-submit"
          :disabled="authLoading"
          @click="connect"
        >
          <span v-if="authLoading">
            {{ mode === 'login' ? '正在登录…' : '正在注册…' }}
          </span>
          <span v-else>
            {{ mode === 'login' ? '登录并进入聊天室' : '注册并进入聊天室' }}
          </span>
        </button>
      </div>
    </div>

    <!-- 聊天主界面 -->
    <div v-else class="chat-section">
      <div class="chat-shell">
        <!-- 左侧：房间列表 -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-title">Chat Rooms</div>
            <div class="sidebar-user">👋 {{ chatStore.username }}</div>
          </div>
          <RoomList
            @start-private-chat="handleStartPrivateChat"
            @select-room="activePrivateChat = null"
          />
        </aside>

        <!-- 右侧：聊天区域 -->
        <main class="chat-main">
          <header class="chat-header">
            <div class="chat-header-left">
              当前用户：<strong>{{ chatStore.username }}</strong>
              <span v-if="chatStore.isDemoMode" class="demo-badge">Demo Mode</span>
            </div>
            <div class="chat-header-right">
              <button class="header-btn" @click="goProfile">个人资料</button>
              <button class="header-btn danger" @click="logout">退出</button>
            </div>
          </header>

          <section class="chat-content">
            <PrivateChat
              v-if="activePrivateChat"
              :target-user-id="activePrivateChat"
              :target-user="getTargetUser(activePrivateChat)"
              @close="activePrivateChat = null"
            />
            <ChatRoom v-else />
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '../stores/chat';
import RoomList from '../components/chat/RoomList.vue';
import ChatRoom from '../components/chat/ChatRoom.vue';
import PrivateChat from '../components/chat/PrivateChat.vue';
import { login, register as registerApi } from '../services/auth';

const chatStore = useChatStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const mode = ref('login'); // 'login' or 'register'
const authError = ref('');
const authLoading = ref(false);

const activePrivateChat = ref(null);

const isConnected = computed(() => chatStore.isConnected);

const connect = async () => {
  authError.value = '';

  const name = username.value.trim();

  if (!name) {
    authError.value = '用户名不能为空';
    return;
  }
  if (!password.value) {
    authError.value = '密码不能为空';
    return;
  }
  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    authError.value = '两次输入的密码不一致';
    return;
  }

  authLoading.value = true;

  try {
    let data;
    if (mode.value === 'register') {
      data = await registerApi(name, password.value);
    } else {
      data = await login(name, password.value);
    }

    const userId = data.userId;
    console.log('Auth success, connecting socket with:', { userId, username: name });
    chatStore.connect(userId, name);
  } catch (err) {
    console.error(err);
    authError.value = err.message || '登录/注册失败，请稍后重试。';
  } finally {
    authLoading.value = false;
  }
};

const handleStartPrivateChat = (targetUserId) => {
  activePrivateChat.value = targetUserId;
};

const getTargetUser = (targetUserId) => {
  return chatStore.onlineUsers.find((u) => u.userId === targetUserId) || null;
};

const goProfile = () => {
  router.push('/profile');
};

const logout = () => {
  chatStore.disconnect();
  activePrivateChat.value = null;
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
  mode.value = 'login';
};
</script>

<style scoped>
/* 整个页面：铺满窗口 + 渐变背景 */
.page-root {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: radial-gradient(circle at top left, #667eea 0, #764ba2 40%, #1a202c 100%);
  box-sizing: border-box;
}

/* 登录页：内容居中 */
.auth-section {
  flex: 1;
  display: flex;
  padding: 0;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
}

/* 聊天页：内容直接贴满，不再居中留白 */
.chat-section {
  flex: 1;
  display: flex;
  padding: 0;
  box-sizing: border-box;
}

/* =============== 登录卡片 =============== */

.auth-card {
  width: 360px;
  max-width: 90vw;
  padding: 32px 28px 26px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
  text-align: center;
}

.app-subtitle {
  font-size: 13px;
  color: #718096;
  text-align: center;
  margin-bottom: 16px;
}

.auth-mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.auth-mode-btn {
  flex: 1;
  padding: 6px 0;
  border-radius: 999px;
  border: 1px solid #cbd5e0;
  background: #edf2f7;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-mode-btn.active {
  background: #667eea;
  color: #fff;
  border-color: #5a67d8;
}

.auth-field {
  margin-bottom: 10px;
}

.auth-field label {
  display: block;
  margin-bottom: 2px;
  font-size: 13px;
  color: #4a5568;
}

.auth-field input {
  width: 100%;
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-field input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.35);
}

.auth-error {
  font-size: 13px;
  color: #e53e3e;
  margin-bottom: 10px;
}

.auth-submit {
  width: 100%;
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.auth-submit:hover:not(:disabled) {
  opacity: 0.96;
  transform: translateY(-1px);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: default;
}

/* =============== 聊天界面：左右铺满，不吞内容 =============== */

.chat-shell {
  width: 100%;
  height: 100vh;              /* 直接跟窗口一样高 */
  display: flex;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.92);
}

/* 左侧侧边栏固定宽度，不被挤扁 */
.sidebar {
  width: 260px;
  flex-shrink: 0;             /* 不随窗口缩小 */
  background: rgba(17, 24, 39, 0.97);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  box-sizing: border-box;
}

.sidebar-header {
  margin-bottom: 10px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-user {
  margin-top: 4px;
  font-size: 13px;
  color: #a0aec0;
}

/* 右侧聊天主体：占满剩余空间，可以压缩但不裁剪 */
.chat-main {
  flex: 1;
  min-width: 0;               /* 关键：允许里面内容在横向收缩 */
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 50%, #e2e8f0 100%);
}

/* 顶部栏 */
.chat-header {
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: 10px;
}

.chat-header-left {
  font-size: 14px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #fff7ed;
  color: #c05621;
  border: 1px solid #fbd38d;
  font-size: 12px;
  font-weight: 600;
}

.chat-header-right {
  display: flex;
  gap: 8px;
}

.header-btn {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #edf2f7;
  font-size: 13px;
  cursor: pointer;
}

.header-btn.danger {
  background: #fed7d7;
  border-color: #feb2b2;
  color: #c53030;
}

/* 聊天内容区域：可滚动，不会被“吞掉” */
.chat-content {
  flex: 1;
  min-height: 0;              /* 允许纵向收缩 */
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  overflow: auto;             /* 超出出现滚动条 */
  display: flex;
  flex-direction: column;
}

/* 小屏幕下自适应 */
@media (max-width: 900px) {
  .chat-shell {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
