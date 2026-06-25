<template>
  <div class="private-chat">
    <div class="chat-header">
      <h2>{{ targetUser?.username || 'Private Chat' }}</h2>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div
        v-for="message in privateMessages"
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
          placeholder="Type a private message..."
          class="chat-input"
        />
        <button @click="sendTextMessage" class="send-button">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useChatStore } from '../../stores/chat';
import { uploadChatMedia } from '../../services/chatMedia';

const props = defineProps({
  targetUserId: {
    type: String,
    required: true
  },
  targetUser: {
    type: Object,
    default: null
  }
});

defineEmits(['close']);

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

const privateMessages = computed(() => chatStore.privateMessages(props.targetUserId));
const userId = computed(() => chatStore.userId);

const sendPrivatePayload = (payload) => {
  chatStore.sendMessage({
    roomId: null,
    targetUserId: props.targetUserId,
    isPrivate: true,
    ...payload
  });
};

// 发送纯文本消息（兼容原来逻辑）
const sendTextMessage = () => {
  if (newMessage.value.trim()) {
    sendPrivatePayload({
      message: newMessage.value.trim(),
      messageType: 'text',
      mediaUrl: null
    });
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
  sendPrivatePayload({
    message: '[sticker]',
    messageType: 'sticker',
    mediaUrl: url
  });
  showStickerPanel.value = false;
};

// 选择图片后上传并发送图片消息
const onImageSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const url = await uploadChatMedia(file, 'image');
    sendPrivatePayload({
      message: '',
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
        sendPrivatePayload({
          message: '',
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
  privateMessages,
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

onBeforeUnmount(() => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
  }
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
  }
});
</script>

<style scoped>
.private-chat {
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
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
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
  background: #28a745;
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.username {
  font-weight: 600;
}

.own-message .username {
  color: rgba(255, 255, 255, 0.9);
}

.timestamp {
  opacity: 0.7;
  margin-left: 0.5rem;
}

.message-content {
  word-wrap: break-word;
}

.message-image {
  max-width: 200px;
  border-radius: 8px;
  display: block;
}

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

.chat-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border-top: 1px solid #e0e0e0;
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
  border: 1px solid #d6eadb;
  background: #f6fbf7;
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

.chat-input:focus {
  outline: none;
  border-color: #28a745;
}

.send-button {
  padding: 0.5rem 1.25rem;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.send-button:hover {
  background: #218838;
}
</style>

