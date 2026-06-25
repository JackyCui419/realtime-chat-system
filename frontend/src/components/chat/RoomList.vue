<template>
  <div class="room-list">
    <div class="room-list-header">
      <h3>Chat Rooms</h3>
      <button @click="showCreateRoom = true" class="create-room-btn">+ New Room</button>
    </div>

    <div v-if="showCreateRoom" class="create-room-form">
      <input
        v-model="newRoomName"
        @keyup.enter="createRoom"
        type="text"
        placeholder="Room name..."
        class="room-input"
      />
      <div class="form-actions">
        <button @click="createRoom" class="btn-primary">Create</button>
        <button @click="cancelCreate" class="btn-secondary">Cancel</button>
      </div>
    </div>

    <div class="rooms">
      <div
        v-for="room in rooms"
        :key="room.id"
        @click="selectRoom(room.id)"
        class="room-item"
        :class="{ active: room.id === currentRoom }"
      >
        <div class="room-info">
          <span class="room-name">{{ room.name }}</span>
          <span class="room-meta">{{ room.memberCount }} members</span>
        </div>
      </div>
    </div>

    <div class="private-messages-section">
      <h4>Private Messages</h4>
      <div
        v-for="user in onlineUsers"
        :key="user.userId"
        @click="startPrivateChat(user.userId)"
        class="user-item"
      >
        <span class="user-name">{{ user.username }}</span>
        <span class="online-indicator">●</span>
      </div>
      <div v-if="onlineUsers.length === 0" class="no-users">
        No other users online
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useChatStore } from '../../stores/chat';

const chatStore = useChatStore();
const showCreateRoom = ref(false);
const newRoomName = ref('');
let refreshTimer = null;

const rooms = computed(() => chatStore.rooms);
const currentRoom = computed(() => chatStore.currentRoom);
const onlineUsers = computed(() => chatStore.onlineUsers);

const selectRoom = (roomId) => {
  chatStore.joinRoom(roomId);
  emit('select-room', roomId);
};

const createRoom = () => {
  if (newRoomName.value.trim()) {
    const roomId = newRoomName.value.toLowerCase().replace(/\s+/g, '-');
    chatStore.createRoom(roomId, newRoomName.value.trim());
    chatStore.joinRoom(roomId);
    newRoomName.value = '';
    showCreateRoom.value = false;
  }
};

const cancelCreate = () => {
  showCreateRoom.value = false;
  newRoomName.value = '';
};

const startPrivateChat = (targetUserId) => {
  // Emit event to parent to switch to private chat view
  emit('start-private-chat', targetUserId);
};

const emit = defineEmits(['start-private-chat', 'select-room']);

onMounted(() => {
  chatStore.getOnlineUsers();
  // Refresh online users periodically
  refreshTimer = setInterval(() => {
    chatStore.getOnlineUsers();
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});
</script>

<style scoped>
.room-list {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.room-list-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-list-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.create-room-btn {
  padding: 0.25rem 0.5rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.create-room-btn:hover {
  background: #0056b3;
}

.create-room-form {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.room-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: #fff;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}

.rooms {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.room-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.room-item:hover {
  background: #f5f5f5;
}

.room-item.active {
  background: #e3f2fd;
  border-left: 3px solid #007bff;
}

.room-info {
  display: flex;
  flex-direction: column;
}

.room-name {
  font-weight: 500;
  color: #333;
}

.room-meta {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.private-messages-section {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.private-messages-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
}

.user-item {
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f5f5;
}

.user-name {
  font-size: 0.875rem;
  color: #333;
}

.online-indicator {
  color: #28a745;
  font-size: 0.75rem;
}

.no-users {
  padding: 0.5rem;
  color: #999;
  font-size: 0.875rem;
  font-style: italic;
}
</style>

