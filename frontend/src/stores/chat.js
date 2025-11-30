import { defineStore } from 'pinia';
import socketService from '../services/socket';

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentRoom: 'general',
    rooms: [],
    messages: [], // All messages (room + private)
    onlineUsers: [],
    roomMembers: [],
    isConnected: false,
    userId: null,
    username: null
  }),

  getters: {
    currentRoomMessages: (state) => {
      const filtered = state.messages.filter(
        msg => !msg.isPrivate && msg.roomId === state.currentRoom
      );
      console.log('Filtering messages - currentRoom:', state.currentRoom, 'total messages:', state.messages.length, 'filtered:', filtered.length);
      return filtered;
    },
    
    privateMessages: (state) => {
      return (targetUserId) => {
        return state.messages.filter(
          msg => msg.isPrivate && 
          ((msg.userId === state.userId && msg.targetUserId === targetUserId) ||
           (msg.userId === targetUserId && msg.targetUserId === state.userId))
        );
      };
    }
  },

  actions: {
    connect(userId, username) {
      this.userId = userId;
      this.username = username;
      
      const socket = socketService.connect(userId, username);
      
      if (!socket) {
        console.error('Failed to create socket connection');
        return;
      }

      // Set up listeners immediately (they'll work once socket connects)
      this.setupSocketListeners();
      
      // Handle connection status
      const handleConnect = () => {
        console.log('Socket connected, setting isConnected to true');
        this.isConnected = true;
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      };

      const handleError = (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      };

      // Set up connection listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleError);
      
      // If already connected, set status immediately
      if (socket.connected) {
        console.log('Socket already connected');
        this.isConnected = true;
      }
    },

    disconnect() {
      socketService.disconnect();
      this.isConnected = false;
      this.messages = [];
      this.rooms = [];
      this.onlineUsers = [];
    },

    setupSocketListeners() {
      // Available rooms
      socketService.on('available-rooms', (rooms) => {
        console.log('Received available rooms:', rooms);
        this.rooms = rooms;
        // Ensure default room exists
        if (!this.rooms.find(r => r.id === 'general')) {
          this.rooms.unshift({
            id: 'general',
            name: 'General',
            type: 'public',
            memberCount: 0
          });
        }
      });

      // Room created
      socketService.on('room-created', (room) => {
        const exists = this.rooms.find(r => r.id === room.id);
        if (!exists) {
          this.rooms.push(room);
        }
      });

      // New message
      socketService.on('new-message', (message) => {
        console.log('Received message:', message);
        this.messages.push(message);
        console.log('Total messages:', this.messages.length);
        console.log('Current room messages:', this.currentRoomMessages.length);
      });

      // Online users
      socketService.on('online-users', (users) => {
        this.onlineUsers = users;
      });

      // Room members
      socketService.on('room-members', (data) => {
        if (data.room === this.currentRoom) {
          this.roomMembers = data.members;
        }
      });

      // User joined/left room
      socketService.on('user-joined-room', (data) => {
        console.log(`${data.username} joined ${data.room}`);
      });

      socketService.on('user-left-room', (data) => {
        console.log(`${data.username} left ${data.room}`);
      });
    },

    createRoom(roomId, roomName) {
      socketService.createRoom(roomId, roomName);
    },

    joinRoom(roomId) {
      this.currentRoom = roomId;
      // Clear messages for the new room (optional - you might want to keep history)
      this.messages = this.messages.filter(
        msg => msg.roomId !== roomId && msg.isPrivate
      );
      socketService.joinRoom(roomId);
    },

    // 支持两种调用方式：
    // 1) sendMessage('hello')                       -> 文字消息（原来那种）
    // 2) sendMessage({ messageType:'image', mediaUrl:'...', ... }) -> 带类型的消息
    sendMessage(messageOrPayload, isPrivate = false, targetUserId = null) {
      let messageData;

      if (typeof messageOrPayload === 'string') {
        // 兼容老用法：纯文本
        messageData = {
          message: messageOrPayload,
          roomId: isPrivate ? null : this.currentRoom,
          isPrivate,
          targetUserId,
          messageType: 'text',
          mediaUrl: null
        };
      } else if (messageOrPayload && typeof messageOrPayload === 'object') {
        // 新用法：对象形式，可以传 messageType / mediaUrl
        const isPriv = !!messageOrPayload.isPrivate;

        messageData = {
          message: messageOrPayload.message ?? '',
          roomId:
            messageOrPayload.roomId ??
            (isPriv ? null : this.currentRoom),
          isPrivate: isPriv,
          targetUserId: messageOrPayload.targetUserId ?? null,
          messageType: messageOrPayload.messageType || 'text',
          mediaUrl: messageOrPayload.mediaUrl || null
        };
      } else {
        console.error('sendMessage called with invalid payload', messageOrPayload);
        return;
      }

      console.log('Sending message:', messageData);
      console.log('Current room:', this.currentRoom);
      console.log('Socket connected:', socketService.isConnected);

      socketService.sendMessage(messageData);
    },

    getOnlineUsers() {
      socketService.getOnlineUsers();
    }
  }
});

