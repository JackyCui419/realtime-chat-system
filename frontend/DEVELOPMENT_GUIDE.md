# Web Application Development Guide

This guide outlines how to develop a full-stack web application meeting all the specified requirements.

## 📋 Requirements Overview (Simplified Path to 15 Points Each)

### 1. Backend Technologies (15 points) ✅
**Selected Requirements:**
- ✅ Private GitHub repository (5 points)
- ✅ Google Cloud Console deployment with public URL (5 points)
- ✅ Docker image setup (5 points)
- **Total: 15 points**

*Note: Skipping Nginx on Linux VM and device-to-device communication to keep it simple.*

### 2. Login and Registration (15 points) ✅
**Selected Requirements:**
- ✅ Classic login/registration system (5 points)
- ✅ Classic system with profile update (text, number, image) (10 points)
- **Total: 15 points**

*Note: Skipping Google OAuth and unified access to keep it simple.*

### 3. Chat Room Features (15 points) ✅
**Selected Requirements:**
- ✅ Single chat room (5 points)
- ✅ Multiple chat rooms + private messages (10 points)
- **Total: 15 points**

*Note: Skipping rich media, video conferencing, and whiteboard to keep it simple.*

---

## 🏗️ Architecture Overview

### Recommended Stack

**Frontend:**
- Vue 3 (Composition API)
- Vue Router (navigation)
- Pinia (state management)
- Socket.io-client (real-time communication)
- Axios (HTTP requests)
- Tailwind CSS or Vuetify (UI framework)

**Backend:**
- Node.js + Express.js
- Socket.io (WebSocket for real-time chat)
- MongoDB or PostgreSQL (database)
- JWT (token-based auth)
- bcryptjs (password hashing)
- Multer (file uploads)

**Infrastructure:**
- Docker & Docker Compose
- Linux VM (Ubuntu/Debian)
- Google Cloud Platform
- (Optional: Nginx for reverse proxy)

---

## 📁 Project Structure

```
project-root/
├── frontend/              # Vue 3 application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   ├── RegisterForm.vue
│   │   │   │   └── OAuthButton.vue
│   │   │   ├── chat/
│   │   │   │   ├── ChatRoom.vue
│   │   │   │   ├── ChatMessage.vue
│   │   │   │   ├── ChatInput.vue
│   │   │   │   ├── RoomList.vue
│   │   │   │   ├── VideoConference.vue
│   │   │   │   └── Whiteboard.vue
│   │   │   └── profile/
│   │   │       └── ProfileEdit.vue
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── ChatView.vue
│   │   │   └── ProfileView.vue
│   │   ├── stores/
│   │   │   ├── auth.js
│   │   │   └── chat.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── router/
│   │       └── index.js
│   └── package.json
│
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   └── chat.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── ChatRoom.js
│   │   │   └── Message.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── socket.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── Dockerfile
└── .gitignore
```

---

## 🚀 Implementation Steps

### Phase 1: Project Setup & Backend Foundation

#### Step 1.1: Initialize Backend
```bash
mkdir backend && cd backend
npm init -y
npm install express socket.io mongoose jsonwebtoken bcryptjs passport passport-google-oauth20 multer cors dotenv
npm install --save-dev nodemon
```

#### Step 1.2: Backend Server Structure
Create `backend/src/server.js`:
- Express server setup
- Socket.io integration
- Database connection
- Route mounting
- Error handling

#### Step 1.3: Database Models
- **User Model**: email, password (hashed), profile data (text, number, image)
- **ChatRoom Model**: name, type (public/private), members
- **Message Model**: content, type (text), roomId, userId, isPrivate (boolean)

### Phase 2: Authentication System (Simplified)

#### Step 2.1: Classic Login/Registration (5 points)
1. Create registration endpoint (`POST /api/auth/register`)
   - Hash passwords with bcrypt
   - Validate input
   - Create user in database
   - Return JWT token

2. Create login endpoint (`POST /api/auth/login`)
   - Verify credentials
   - Return JWT token

3. Frontend components:
   - `LoginForm.vue` - email/password form
   - `RegisterForm.vue` - registration form with validation
   - Store JWT in localStorage/cookies

#### Step 2.2: Profile Management (10 points)
1. Create profile endpoints:
   - `GET /api/users/profile` - get user profile
   - `PUT /api/users/profile` - update profile
   - Support text, number, and image fields

2. Frontend:
   - `ProfileEdit.vue` component
   - File upload for images (Multer backend)
   - Form validation for text, number, and image fields

*Note: Skipping Google OAuth and unified access to keep implementation simple.*

### Phase 3: Chat Room Features (Simplified)

#### Step 3.1: Basic Single Chat Room (5 points)
1. Backend Socket.io:
   - Connection handling
   - Join room event
   - Send message event
   - Broadcast to room

2. Frontend:
   - `ChatRoom.vue` component
   - Socket.io client connection
   - Message display
   - Input form

#### Step 3.2: Multiple Rooms + Private Messages (10 points)
1. Backend:
   - Room management (create, join, leave)
   - Private message routing
   - User presence tracking
   - Separate rooms for different conversations

2. Frontend:
   - `RoomList.vue` - list of available rooms
   - Room switching functionality
   - Private message interface
   - User list for private messaging

*Note: Skipping rich media, video conferencing, and whiteboard to keep implementation simple.*

### Phase 4: Docker & Deployment

#### Step 4.1: Docker Setup
1. **Backend Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

2. **Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

3. **docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/app
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
```

#### Step 4.2: Google Cloud Deployment (Simplified)
1. Create GCP project
2. Set up Compute Engine VM (Ubuntu)
3. Install Docker and Docker Compose
4. Clone repository
5. Configure environment variables
6. Run `docker-compose up -d`
7. Configure firewall rules for HTTP/HTTPS
8. Access via public IP or set up domain

*Note: Skipping Nginx setup to keep deployment simple. Can use Express to serve static files or add Nginx later if needed.*

#### Step 4.3: Private GitHub Repository
1. Initialize git: `git init`
2. Create `.gitignore` (node_modules, .env, etc.)
3. Create private repository on GitHub
4. Add remote and push code
5. Keep repository private throughout development

*Note: Skipping device-to-device communication without public URL to keep implementation simple.*

---

## 🔧 Key Implementation Details

### Authentication Middleware
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Socket.io Room Management
```javascript
// backend/src/config/socket.js
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('user-joined', socket.userId);
  });
  
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('new-message', data);
  });
});
```

### File Upload (Multer)
```javascript
// backend/src/middleware/upload.js
const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
```

---

## 📝 Environment Variables

Create `.env` files:

**Backend `.env`:**
```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/app
JWT_SECRET=your-secret-key
NODE_ENV=development
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## ✅ Testing Checklist

### Backend Technologies (Simplified)
- [ ] Repository is private on GitHub
- [ ] Docker image builds successfully
- [ ] Application deployed on Google Cloud with public URL
- [ ] Application accessible via public URL

### Authentication (Simplified)
- [ ] Classic registration creates user
- [ ] Classic login returns JWT token
- [ ] Profile update saves text field
- [ ] Profile update saves number field
- [ ] Profile update saves image

### Chat Features (Simplified)
- [ ] Single chat room displays messages
- [ ] Multiple rooms can be created/joined
- [ ] Users can switch between rooms
- [ ] Private messages work between users
- [ ] Private messages are separate from room messages

---

## 🎯 Scoring Strategy (Simplified)

**Minimum requirements to achieve 15 points per category:**

1. **Backend Technologies**: GitHub (5) + GCP Deployment (5) + Docker (5) = **15 points**
2. **Login/Registration**: Classic login/reg (5) + Profile update (10) = **15 points**
3. **Chat Room**: Single room (5) + Multiple rooms + private messages (10) = **15 points**

This approach focuses on core functionality while meeting the 15-point requirement for each category.

---

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Socket.io Guide](https://socket.io/docs/v4/)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Google Cloud Platform](https://cloud.google.com/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

---

## 🚨 Common Issues & Solutions

1. **CORS Errors**: Configure CORS middleware properly
2. **Socket.io Connection Issues**: Check WebSocket proxy in Nginx
3. **OAuth Callback Mismatch**: Ensure callback URL matches exactly
4. **Docker Build Fails**: Check Dockerfile syntax and dependencies
5. **File Upload Size Limits**: Configure Nginx and Multer limits
6. **WebRTC Connection**: Use STUN/TURN servers for NAT traversal

---

This guide provides a comprehensive roadmap. Start with Phase 1 and work through each phase systematically.

