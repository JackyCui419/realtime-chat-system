# Quick Start - Simplified Requirements (15 Points Each)

## 📊 Requirements Summary

### 1. Backend Technologies (15 points)
- ✅ Private GitHub repository (5 points)
- ✅ Google Cloud deployment with public URL (5 points)
- ✅ Docker image setup (5 points)

### 2. Login and Registration (15 points)
- ✅ Classic login/registration (5 points)
- ✅ Profile update with text, number, image (10 points)

### 3. Chat Room (15 points)
- ✅ Single chat room (5 points)
- ✅ Multiple rooms + private messages (10 points)

---

## 🚀 Quick Implementation Order

### Step 1: Backend Setup (Day 1-2)
```bash
# Create backend folder
mkdir backend
cd backend
npm init -y
npm install express socket.io mongoose jsonwebtoken bcryptjs multer cors dotenv
```

### Step 2: Frontend Setup (Day 2-3)
```bash
# Already have Vue 3 project, just add dependencies
npm install vue-router pinia axios socket.io-client
```

### Step 3: Authentication (Day 3-5)
- Registration endpoint
- Login endpoint
- JWT middleware
- Profile endpoints (GET, PUT)
- File upload for images

### Step 4: Chat Features (Day 5-7)
- Socket.io server setup
- Single chat room
- Multiple rooms
- Private messaging

### Step 5: Docker & Deployment (Day 7-10)
- Create Dockerfiles
- docker-compose.yml
- Deploy to Google Cloud
- Set up GitHub repository

---

## 📦 Essential Dependencies

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.5.4",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "vue": "^3.5.22",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.0",
    "socket.io-client": "^4.5.4"
  }
}
```

---

## 🎯 Minimum Viable Features

### Authentication
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can view their profile
- [ ] User can update profile text field
- [ ] User can update profile number field
- [ ] User can upload profile image

### Chat
- [ ] Users can join a single chat room
- [ ] Users can send messages in real-time
- [ ] Users can create multiple chat rooms
- [ ] Users can switch between rooms
- [ ] Users can send private messages to other users

### Deployment
- [ ] Code in private GitHub repository
- [ ] Application runs in Docker containers
- [ ] Application deployed on Google Cloud
- [ ] Application accessible via public URL

---

## ⏱️ Estimated Timeline

- **Week 1**: Backend + Authentication + Profile
- **Week 2**: Chat features (single + multiple + private)
- **Week 3**: Docker + Deployment + Testing

**Total: 3 weeks for complete implementation**

---

## 📝 Key Files to Create

### Backend
- `backend/src/server.js` - Main server
- `backend/src/routes/auth.js` - Auth routes
- `backend/src/routes/users.js` - User/profile routes
- `backend/src/routes/chat.js` - Chat routes
- `backend/src/models/User.js` - User model
- `backend/src/models/ChatRoom.js` - Room model
- `backend/src/models/Message.js` - Message model
- `backend/src/middleware/auth.js` - JWT middleware
- `backend/Dockerfile` - Backend container

### Frontend
- `src/router/index.js` - Vue Router
- `src/stores/auth.js` - Auth store
- `src/stores/chat.js` - Chat store
- `src/services/api.js` - API service
- `src/services/socket.js` - Socket service
- `src/views/LoginView.vue` - Login page
- `src/views/RegisterView.vue` - Register page
- `src/views/ProfileView.vue` - Profile page
- `src/views/ChatView.vue` - Chat page
- `Dockerfile` - Frontend container

### Root
- `docker-compose.yml` - Docker orchestration
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation

---

## ✅ Success Criteria

Your application is complete when:

1. ✅ Users can register and login
2. ✅ Users can update their profile (text, number, image)
3. ✅ Users can chat in a single room
4. ✅ Users can create/join multiple rooms
5. ✅ Users can send private messages
6. ✅ Application runs in Docker
7. ✅ Application is deployed on Google Cloud
8. ✅ Code is in private GitHub repository

---

**Ready to start?** Begin with Step 1: Backend Setup!

