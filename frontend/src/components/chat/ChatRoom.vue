<template>
  <div class="chat-room">
    <!-- 顶部房间信息 -->
    <div class="chat-header">
      <h2>{{ currentRoomName }}</h2>
      <span class="member-count">{{ roomMembers.length }} members</span>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div
        v-for="message in currentRoomMessages"
        :key="message.id"
        class="message"
        :class="{ 'own-message': message.userId === userId }"
      >
        <div class="message-header">
          <span class="username">{{ message.username }}</span>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>

        <div class="message-content">
          <!-- 1) 文本消息（老的也兼容） -->
          <template v-if="!message.messageType || message.messageType === 'text'">
            {{ message.message }}
          </template>

          <!-- 2) sticker / 图片消息 -->
          <template
            v-else-if="message.messageType === 'sticker' || message.messageType === 'image'"
          >
            <!-- 注意：这里必须是 < img 没有空格 -->
            <img :src="message.mediaUrl" class="message-image" />
          </template>

          <!-- 3) 语音消息 -->
          <template v-else-if="message.messageType === 'audio'">
            <audio :src="message.mediaUrl" controls preload="none"></audio>
          </template>
        </div>
      </div>
    </div>

    <!-- Emoji 面板 -->
    <div v-if="showEmojiPanel" class="emoji-panel">
      <button
        v-for="e in emojis"
        :key="e"
        class="emoji-item"
        @click="appendEmoji(e)"
      >
        {{ e }}
      </button>
    </div>

    <!-- Sticker 面板 -->
    <div v-if="showStickerPanel" class="sticker-panel">
      <img
        v-for="s in stickers"
        :key="s"
        :src="s"
        class="sticker-item"
        @click="sendSticker(s)"
      />
    </div>

    <!-- 底部输入 + 工具栏 -->
    <div class="chat-input-container">
      <!-- 工具按钮行：emoji / sticker / 图片 / 语音 -->
      <div class="chat-tools">
        <button class="icon-btn" @click="toggleEmojiPanel">😊</button>
        <button class="icon-btn" @click="toggleStickerPanel">🖼</button>

        <label class="icon-btn">
          📷
          <input
            type="file"
            accept="image/*"
            @change="onImageSelected"
            style="display: none"
          />
        </label>

        <button class="icon-btn" @click="toggleRecording">
          {{ isRecording ? '⏹' : '🎤' }}
        </button>
      </div>

      <!-- 文本输入行 -->
      <div class="chat-input-main">
        <input
          v-model="newMessage"
          @keyup.enter="sendTextMessage"
          type="text"
          placeholder="Type a message..."
          class="chat-input"
        />
        <button @click="sendTextMessage" class="send-button">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useChatStore } from '../../stores/chat';

const chatStore = useChatStore();

const newMessage = ref('');
const messagesContainer = ref(null);

// 额外状态：emoji / sticker / 录音
const showEmojiPanel = ref(false);
const showStickerPanel = ref(false);
const isRecording = ref(false);

// 简单的 emoji 和 sticker 列表
const emojis = ['😀', '😂', '😍', '👍', '🙏', '🎉'];
// 注意：这些路径是从 public/ 目录开始的
// 请在 frontend/public/stickers/ 下放几张图片，名字对应就行
const stickers = [
  '/stickers/sticker1.jpeg',
  '/stickers/sticker2.webp',
  '/stickers/sticker3.webp'
];

// 后端 API 地址
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const currentRoomName = computed(() => {
  const room = chatStore.rooms.find((r) => r.id === chatStore.currentRoom);
  return room?.name || chatStore.currentRoom;
});

const currentRoomMessages = computed(() => chatStore.currentRoomMessages);
const roomMembers = computed(() => chatStore.roomMembers);
const userId = computed(() => chatStore.userId);

// 发送纯文本消息（兼容原来逻辑）
const sendTextMessage = () => {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value.trim());
    newMessage.value = '';
  }
};

// emoji 追加到输入框
const appendEmoji = (e) => {
  newMessage.value += e;
};

// 开关面板
const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value;
  if (showEmojiPanel.value) {
    showStickerPanel.value = false;
  }
};

const toggleStickerPanel = () => {
  showStickerPanel.value = !showStickerPanel.value;
  if (showStickerPanel.value) {
    showEmojiPanel.value = false;
  }
};

// 发送 sticker：只传类型 + 图片地址
const sendSticker = (url) => {
  chatStore.sendMessage({
    roomId: chatStore.currentRoom,
    message: '[sticker]',
    isPrivate: false,
    messageType: 'sticker',
    mediaUrl: url
  });
  showStickerPanel.value = false;
};

// 封装一个上传聊天媒体的函数（图片 / 语音）
// ⚠️ 这里返回完整 URL，带 http://localhost:3000
async function uploadChatMedia(file, type = 'image') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch(`${API_BASE}/api/upload/chat-media`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Upload failed');
  }
  // 关键：加上 API_BASE，变成 http://localhost:3000/uploads/xxx
  return `${API_BASE}${data.url}`;
}

// 选择图片后上传并发送图片消息
const onImageSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const url = await uploadChatMedia(file, 'image');
    chatStore.sendMessage({
      roomId: chatStore.currentRoom,
      message: '',
      isPrivate: false,
      messageType: 'image',
      mediaUrl: url
    });
  } catch (err) {
    console.error(err);
    alert('Image upload failed');
  } finally {
    // 允许再次选择同一个文件
    event.target.value = '';
  }
};

// 语音录制相关（带类型检测，更稳一点）
let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;
let recordingMimeType = '';

const toggleRecording = async () => {
  // 如果正在录音 -> 停止并触发 onstop
  if (isRecording.value) {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    return;
  }

  // 浏览器不支持
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    alert('当前浏览器不支持语音录制，请用 Chrome 打开试试。');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    currentStream = stream;

    // 选择一个浏览器支持的 mimeType
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      recordingMimeType = 'audio/webm;codecs=opus';
      mediaRecorder = new MediaRecorder(stream, { mimeType: recordingMimeType });
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      recordingMimeType = 'audio/ogg;codecs=opus';
      mediaRecorder = new MediaRecorder(stream, { mimeType: recordingMimeType });
    } else {
      // 实在没得选，就让浏览器自己决定
      recordingMimeType = '';
      mediaRecorder = new MediaRecorder(stream);
    }

    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      isRecording.value = false;

      // 关闭麦克风
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
        currentStream = null;
      }

      if (audioChunks.length === 0) return;

      const mime = recordingMimeType || 'audio/webm';
      const ext = mime.startsWith('audio/ogg') ? 'ogg' : 'webm';

      const blob = new Blob(audioChunks, { type: mime });
      const file = new File([blob], `voice-${Date.now()}.${ext}`, {
        type: mime
      });

      try {
        const url = await uploadChatMedia(file, 'audio');
        console.log('uploaded audio url:', url);
        chatStore.sendMessage({
          roomId: chatStore.currentRoom,
          message: '',
          isPrivate: false,
          messageType: 'audio',
          mediaUrl: url
        });
      } catch (err) {
        console.error(err);
        alert('Audio upload failed');
      }
    };

    mediaRecorder.start();
    isRecording.value = true;
  } catch (err) {
    console.error(err);
    alert('Cannot access microphone');
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 自动滚到底部
watch(
  currentRoomMessages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    });
  },
  { deep: true }
);

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop =
      messagesContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.chat-header {
  background: #fff;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.member-count {
  font-size: 0.875rem;
  color: #666;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  background: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  max-width: 70%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.own-message {
  align-self: flex-end;
  background: #007bff;
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

.username {
  font-weight: bold;
}

.timestamp {
  font-size: 0.75rem;
}

.message-content {
  font-size: 0.95rem;
  word-wrap: break-word;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
  display: block;
}

/* emoji / sticker 面板 */
.emoji-panel,
.sticker-panel {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
}

.emoji-item {
  font-size: 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  margin: 0 4px;
}

.sticker-item {
  width: 64px;
  height: 64px;
  margin: 4px;
  cursor: pointer;
}

/* 底部输入区 */
.chat-input-container {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #f7fafc;
  cursor: pointer;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chat-input-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 999px;
  font-size: 1rem;
}

.send-button {
  padding: 0.5rem 1.25rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.send-button:hover {
  background: #0056b3;
}
</style>