# Real-Time Chat System

A full-stack real-time chat product prototype built with **Vue 3, Node.js, Express, Socket.IO, and MySQL**.  
The project is designed around real-time communication scenarios and supports **public chat, private chat, room management, user profiles, avatar upload, and media message upload**.

---

## Project Overview

This project aims to build a complete real-time chat system from both **product design** and **technical implementation** perspectives.  
Instead of only focusing on front-end pages or back-end APIs, the project was designed as a full communication system with clear user flow, functional modules, and state transitions.

The system covers:
- User registration and login
- Public chat room
- Private messaging
- Room creation and switching
- Online user status
- User profile editing
- Avatar upload
- Image / video message upload

---

## Core Features

### 1. User System
- User registration and login
- Password encryption with bcryptjs
- User profile retrieval and update
- Avatar upload

### 2. Real-Time Messaging
- Public room chat
- Private one-to-one chat
- Real-time message synchronization using Socket.IO
- Text, image, and video message support

### 3. Room Management
- Default public room
- Custom room creation
- Room switching
- Room member synchronization

### 4. Profile & Media
- User avatar upload
- Media file
