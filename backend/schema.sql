CREATE DATABASE IF NOT EXISTS chat_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chat_app;

CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  age INT,
  avatar_path VARCHAR(255),
  last_seen DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  room_id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'public',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  message_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  room_id VARCHAR(120),
  from_user_id VARCHAR(64) NOT NULL,
  to_user_id VARCHAR(64),
  is_private TINYINT(1) NOT NULL DEFAULT 0,
  content TEXT,
  message_type VARCHAR(30) NOT NULL DEFAULT 'text',
  media_url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_room_created (room_id, created_at),
  INDEX idx_messages_private_created (from_user_id, to_user_id, created_at),
  CONSTRAINT fk_messages_room
    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
    ON DELETE SET NULL,
  CONSTRAINT fk_messages_from_user
    FOREIGN KEY (from_user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_messages_to_user
    FOREIGN KEY (to_user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);
