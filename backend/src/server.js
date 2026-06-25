import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chat_app'
});

// 简单测试一下数据库连接
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connected, test result =', rows[0].result);
  } catch (err) {
    console.error('MySQL connection error:', err);
  }
})();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

app.use(cors({ origin: '*' }));

app.use(cors());
app.use(express.json());

// 静态访问上传的头像 / 聊天媒体，例如 http://localhost:3000/uploads/xxxx.jpg
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;

// =================== multer：统一处理头像 + 聊天媒体上传 ===================

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

// =================== 账号相关 API：注册 + 登录 ===================

// 注册接口：写入 MySQL（带 bcrypt hash）
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return res.status(400).json({
      success: false,
      message: 'Username cannot be empty.'
    });
  }

  try {
    // 检查用户名是否已存在
    const [rows] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [cleanUsername]
    );
    if (rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists.'
      });
    }

    // 生成一个简单的 userId（也可以换成 uuid）
    const userId = 'u_' + Date.now();

    // bcrypt hash 密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 插入用户
    await pool.execute(
      `INSERT INTO users (user_id, username, password_hash, last_seen)
       VALUES (?, ?, ?, NOW())`,
      [userId, cleanUsername, passwordHash]
    );

    return res.json({
      success: true,
      userId,
      username: cleanUsername
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// 登录接口：从 MySQL 读取 hash 并校验密码
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return res.status(400).json({
      success: false,
      message: 'Username cannot be empty.'
    });
  }

  try {
    const [rows] = await pool.query(
      'SELECT user_id, password_hash FROM users WHERE username = ?',
      [cleanUsername]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User does not exist.'
      });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');

    if (!ok) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    return res.json({
      success: true,
      userId: user.user_id,
      username: cleanUsername
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// =================== Profile API：获取 & 更新资料 ===================

// 获取某个用户的资料
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, full_name, age, avatar_path
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      profile: rows[0]
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 更新某个用户的资料（文字 + 数字 + 图片）
app.post('/api/profile/:userId', upload.single('avatar'), async (req, res) => {
  const { userId } = req.params;
  const { fullName, age } = req.body || {};

  const ageNumber = age ? parseInt(age, 10) : null;

  // 如果上传了头像文件，就生成路径；没传就保持原来的
  const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // 先确认用户存在
    const [rows] = await pool.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 更新资料：full_name（text）、age（number）、avatar_path（image 路径）
    await pool.execute(
      `UPDATE users
       SET full_name = ?,
           age = ?,
           avatar_path = COALESCE(?, avatar_path)
       WHERE user_id = ?`,
      [
        fullName || null,
        isNaN(ageNumber) ? null : ageNumber,
        avatarPath,
        userId
      ]
    );

    const [updated] = await pool.query(
      `SELECT user_id, username, full_name, age, avatar_path
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      profile: updated[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// =================== 聊天媒体上传（图片 / 语音 / sticker 用） ===================

app.post('/api/upload/chat-media', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // 前端可以在 body 里带一个 type: image / audio / sticker（可选）
  const { type } = req.body || {};
  const url = `/uploads/${req.file.filename}`;

  return res.json({
    success: true,
    url,
    type: type || 'image'
  });
});

// =================== 聊天相关（内存 + 数据库） ===================

// Store active users and rooms
// socket 连接在线名单（内存）
const users = new Map(); // socketId -> { userId, username, currentRoom }
const rooms = new Map(); // roomId -> { name, type, members: Set of socketIds }
const privateMessages = new Map(); // conversationKey -> Set (可选)

// Default room
const DEFAULT_ROOM = 'general';
if (!rooms.has(DEFAULT_ROOM)) {
  rooms.set(DEFAULT_ROOM, {
    name: 'General',
    type: 'public',
    members: new Set()
  });
}

function getAvailableRooms() {
  return Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    type: room.type,
    memberCount: room.members.size
  }));
}

function emitAvailableRooms() {
  io.emit('available-rooms', getAvailableRooms());
}

function getOnlineUsersFor(socketId) {
  const currentUser = users.get(socketId);
  const onlineUsersById = new Map();

  for (const [sid, user] of users.entries()) {
    if (currentUser && user.userId === currentUser.userId) continue;
    if (!onlineUsersById.has(user.userId)) {
      onlineUsersById.set(user.userId, {
        userId: user.userId,
        username: user.username
      });
    }
  }

  return Array.from(onlineUsersById.values());
}

function emitOnlineUsers() {
  for (const socketId of users.keys()) {
    io.to(socketId).emit('online-users', getOnlineUsersFor(socketId));
  }
}

// 确保默认房间写进数据库
(async () => {
  try {
    await pool.execute(
      `INSERT INTO rooms (room_id, name, type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         type = VALUES(type)`,
      [DEFAULT_ROOM, 'General', 'public']
    );
    console.log('Default room ensured in DB');
  } catch (err) {
    console.error('Error ensuring default room in DB:', err);
  }
})();

// =================== Socket.io connection handling ===================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their info（需要已经通过 /api/login 或 /api/register 拿到 userId + username）
  socket.on('user-join', async (userData) => {
    const { userId, username } = userData || {};
    const finalUsername = (username || '').trim();

    if (!userId || !finalUsername) {
      socket.emit('auth-error', 'Missing userId or username, please log in again.');
      return;
    }

    try {
      // 验证这个 userId + username 是否在数据库里
      const [rows] = await pool.query(
        'SELECT user_id FROM users WHERE user_id = ? AND username = ?',
        [userId, finalUsername]
      );
      if (rows.length === 0) {
        console.warn('Unauthenticated user tried to join:', userData);
        socket.emit('auth-error', 'Authentication failed. Please log in again.');
        return;
      }

      // 更新内存在线表
      users.set(socket.id, {
        userId,
        username: finalUsername,
        currentRoom: DEFAULT_ROOM
      });

      // 更新 last_seen（不再插入新行，避免 password_hash 问题）
      try {
        const [result] = await pool.execute(
          `UPDATE users
           SET username = ?, last_seen = NOW()
           WHERE user_id = ?`,
          [finalUsername, userId]
        );

        if (result.affectedRows === 0) {
          console.warn(
            'user-join: 没有找到对应的 user_id，说明可能没通过 /api/login 或 /api/register：',
            userId
          );
        }
      } catch (err) {
        console.error('Error saving user to DB:', err);
      }

      // 加入默认房间
      socket.join(DEFAULT_ROOM);
      rooms.get(DEFAULT_ROOM).members.add(socket.id);

      // 通知房间里的其他人
      socket.to(DEFAULT_ROOM).emit('user-joined-room', {
        username: finalUsername,
        room: DEFAULT_ROOM
      });

      // 把当前房间成员发给新用户
      const roomMembers = Array.from(rooms.get(DEFAULT_ROOM).members)
        .map((sid) => users.get(sid))
        .filter(Boolean);

      socket.emit('room-members', {
        room: DEFAULT_ROOM,
        members: roomMembers
      });

      // 把可用房间列表发给新用户，并刷新所有人的在线/房间状态
      const availableRooms = getAvailableRooms();
      console.log('Sending available rooms:', availableRooms);
      socket.emit('available-rooms', availableRooms);
      emitAvailableRooms();
      emitOnlineUsers();
    } catch (err) {
      console.error('Error during user-join auth:', err);
      socket.emit('auth-error', 'Server error during authentication.');
    }
  });

  // Create a new room
  socket.on('create-room', async (roomData) => {
    const { roomId, roomName } = roomData;
    const finalRoomName = roomName || roomId;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: finalRoomName,
        type: 'public',
        members: new Set()
      });
    }

    // 写入 / 更新 rooms 表
    try {
      await pool.execute(
        `INSERT INTO rooms (room_id, name, type)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           type = VALUES(type)`,
        [roomId, finalRoomName, 'public']
      );
    } catch (err) {
      console.error('Error saving room to DB:', err);
    }

    // 通知所有用户有新房间
    io.emit('room-created', {
      id: roomId,
      name: finalRoomName,
      type: 'public',
      memberCount: rooms.get(roomId)?.members.size || 0
    });
    emitAvailableRooms();
  });

  // Join a room
  socket.on('join-room', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    const currentRoom = user.currentRoom;

    // 离开之前的房间
    if (currentRoom && rooms.has(currentRoom)) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).members.delete(socket.id);
      socket.to(currentRoom).emit('user-left-room', {
        username: user.username,
        room: currentRoom
      });
    }

    // 加入新房间
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        name: roomId,
        type: 'public',
        members: new Set()
      });
    }

    socket.join(roomId);
    rooms.get(roomId).members.add(socket.id);
    user.currentRoom = roomId;

    // 通知新房间里的其他人
    socket.to(roomId).emit('user-joined-room', {
      username: user.username,
      room: roomId
    });

    // 把房间成员发给当前用户
    const roomMembers = Array.from(rooms.get(roomId).members)
      .map((sid) => users.get(sid))
      .filter(Boolean);

    socket.emit('room-members', {
      room: roomId,
      members: roomMembers
    });
    emitAvailableRooms();
  });

  // Send message (room + private)，支持 text / sticker / image / audio
  socket.on('send-message', async (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const {
      roomId,
      message,
      isPrivate,
      targetUserId,
      messageType,
      mediaUrl
    } = messageData || {};

    const type = messageType || 'text';

    // 对 text 类型做内容校验；sticker / image / audio 不强制有 message 文本
    if (type === 'text') {
      if (!message || typeof message !== 'string' || !message.trim()) {
        return;
      }
    }

    if (isPrivate && targetUserId) {
      // 私聊
      const targetSocketEntry = Array.from(users.entries()).find(
        ([sid, u]) => u.userId === targetUserId
      );
      const targetSocketId = targetSocketEntry?.[0];

      if (targetSocketId) {
        const timestamp = new Date().toISOString();

        const messageObj = {
          id: Date.now().toString(),
          userId: user.userId,
          username: user.username,
          message,
          timestamp,
          isPrivate: true,
          targetUserId,
          messageType: type,
          mediaUrl: mediaUrl || null
        };

        // 写入 DB （私聊：带 message_type + media_url）
        try {
          await pool.execute(
            `INSERT INTO messages
               (room_id, from_user_id, to_user_id, is_private, content, message_type, media_url, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [null, user.userId, targetUserId, 1, message || '', type, mediaUrl || null]
          );
        } catch (err) {
          console.error('Error saving private message:', err);
        }

        // 发给两个人
        io.to(targetSocketId).emit('new-message', messageObj);
        socket.emit('new-message', messageObj);

        // 记录会话（可选）
        const user1Id = user.userId;
        const user2Id = targetUserId;
        const conversationKey = [user1Id, user2Id].sort().join('-');
        if (!privateMessages.has(conversationKey)) {
          privateMessages.set(conversationKey, new Set());
        }
      }
    } else {
      // 房间消息
      const targetRoom = roomId || user.currentRoom;
      if (!targetRoom || !rooms.has(targetRoom)) {
        return;
      }

      const timestamp = new Date().toISOString();

      const messageObj = {
        id: Date.now().toString(),
        userId: user.userId,
        username: user.username,
        message,
        roomId: targetRoom,
        timestamp,
        isPrivate: false,
        messageType: type,
        mediaUrl: mediaUrl || null
      };

      // 写入 DB（房间消息：带 message_type + media_url）
      try {
        await pool.execute(
          `INSERT INTO messages
             (room_id, from_user_id, to_user_id, is_private, content, message_type, media_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [targetRoom, user.userId, null, 0, message || '', type, mediaUrl || null]
        );
      } catch (err) {
        console.error('Error saving room message:', err);
      }

      console.log('Sending room message:', messageObj, 'to room:', targetRoom);
      io.to(targetRoom).emit('new-message', messageObj);
    }
  });

  // Get online users (for private messaging)
  socket.on('get-online-users', () => {
    socket.emit('online-users', getOnlineUsersFor(socket.id));
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const currentRoom = user.currentRoom;

      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom).members.delete(socket.id);
        socket.to(currentRoom).emit('user-left-room', {
          username: user.username,
          room: currentRoom
        });
      }

      users.delete(socket.id);
      emitAvailableRooms();
      emitOnlineUsers();
    }
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io server ready');
});
