<template>
  <div class="private-chat">
    <div class="chat-header">
      <h2>{{ targetUser?.username || 'Private Chat' }}</h2>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

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
        <div class="message-content">{{ message.message }}</div>
      </div>
    </div>

    <div class="chat-input-container">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Type a private message..."
        class="chat-input"
      />
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useChatStore } from '../../stores/chat';

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

const emit = defineEmits(['close']);

const chatStore = useChatStore();
const newMessage = ref('');
const messagesContainer = ref(null);

const userId = computed(() => chatStore.userId);
const privateMessages = computed(() => {
  return chatStore.privateMessages(props.targetUserId);
});

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value.trim(), true, props.targetUserId);
    newMessage.value = '';
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Auto-scroll to bottom when new messages arrive
watch(privateMessages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { deep: true });

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
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

.chat-input-container {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff;
  border-top: 1px solid #e0e0e0;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.chat-input:focus {
  outline: none;
  border-color: #28a745;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.send-button:hover {
  background: #218838;
}
</style>

