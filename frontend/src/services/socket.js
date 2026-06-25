import { io } from 'socket.io-client';
import { getMissingBackendMessage, getSocketUrl } from './config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId, username) {
    // If already connected, just return the socket
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    // If socket exists but disconnected, disconnect it first
    if (this.socket) {
      console.log('Disconnecting existing socket');
      this.socket.disconnect();
      this.socket = null;
    }

    const socketUrl = getSocketUrl();
    if (!socketUrl) {
      console.error(getMissingBackendMessage());
      return null;
    }

    console.log('Connecting to:', socketUrl);
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Join with user info
      if (userId && username) {
        console.log('Emitting user-join with:', { userId, username });
        this.socket.emit('user-join', { userId, username });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Room methods
createRoom(roomId, roomName) {
  if (!this.socket?.connected) {
    console.error('Socket not connected');
    return;
  }

  const payload = { roomId, roomName };
  console.log('Emitting create-room with:', payload);
  this.socket.emit('create-room', payload);
}

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  // Message methods
  sendMessage({
    message,
    roomId = null,
    isPrivate = false,
    targetUserId = null,
    messageType = 'text',
    mediaUrl = null
  }) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    const payload = {
      message,
      roomId,
      isPrivate,
      targetUserId,
      messageType,
      mediaUrl
    };

    console.log('Emitting send-message with:', payload);
    this.socket.emit('send-message', payload);
  }

  // User methods
getOnlineUsers() {
  if (!this.socket?.connected) {
    console.error('Socket not connected');
    return;
  }

  console.log('Emitting get-online-users');
  this.socket.emit('get-online-users');
}

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      // If socket not ready, wait for connection
      const checkSocket = setInterval(() => {
        if (this.socket) {
          this.socket.on(event, callback);
          clearInterval(checkSocket);
        }
      }, 100);
      
      // Clear after 5 seconds if still not connected
      setTimeout(() => clearInterval(checkSocket), 5000);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();

