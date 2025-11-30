# Chat Application Setup Guide

## 📦 Installation

### Frontend Dependencies
```bash
npm install socket.io-client vue-router@4 pinia axios
```

### Backend Dependencies
```bash
cd backend
npm install
```

## 🚀 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:3000`

### 2. Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
Create `.env` in the root:
```
VITE_SOCKET_URL=http://localhost:3000
```

## ✨ Features Implemented

### ✅ Single Chat Room (5 points)
- Users can join a default "General" room
- Real-time message sending and receiving
- Message history display
- User presence indicators

### ✅ Multiple Rooms + Private Messages (10 points)
- Create new chat rooms
- Switch between multiple rooms
- View list of available rooms
- Send private messages to other users
- Separate private chat interface
- Online users list

## 📁 Project Structure

```
backend/
  src/
    server.js          # Socket.io server with room and private message handling

src/
  components/
    chat/
      ChatRoom.vue     # Single room chat component
      RoomList.vue     # Room list and private message users
      PrivateChat.vue  # Private message interface
  views/
    ChatView.vue       # Main chat view
  services/
    socket.js          # Socket.io service wrapper
  stores/
    chat.js            # Pinia store for chat state
  router/
    index.js           # Vue Router configuration
```

## 🎯 Usage

1. **Connect to Chat**: Enter your username and user ID (optional) to connect
2. **Join Rooms**: Click on any room in the sidebar to join
3. **Create Room**: Click "+ New Room" to create a new chat room
4. **Private Messages**: Click on any online user to start a private conversation
5. **Send Messages**: Type in the input field and press Enter or click Send

## 🔌 Socket.io Events

### Client → Server
- `user-join` - User connects with userId and username
- `create-room` - Create a new room
- `join-room` - Join a specific room
- `send-message` - Send a message (room or private)
- `get-online-users` - Request list of online users

### Server → Client
- `available-rooms` - List of all available rooms
- `room-created` - New room created
- `new-message` - New message received
- `online-users` - List of online users
- `room-members` - Members in current room
- `user-joined-room` - User joined a room
- `user-left-room` - User left a room

## 🐛 Troubleshooting

### Connection Issues
- Ensure backend server is running on port 3000
- Check that `VITE_SOCKET_URL` matches backend URL
- Verify CORS settings in backend server

### Messages Not Appearing
- Check browser console for errors
- Verify Socket.io connection is established
- Ensure you're in the correct room

## 📝 Next Steps

To complete the full application requirements:
1. Add authentication system (login/registration)
2. Add profile management
3. Set up Docker containers
4. Deploy to Google Cloud
5. Create private GitHub repository

