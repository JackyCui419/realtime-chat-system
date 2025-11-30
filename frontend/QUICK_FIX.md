# Quick Fix: Start Backend Server

## The Problem
Your console shows: `WebSocket connection to 'ws://localhost:3000/socket.io/' failed`

This means **the backend server is NOT running**.

## Solution (3 Steps)

### Step 1: Install Backend Dependencies
Open a **NEW terminal** in VS Code and run:

```powershell
cd backend
npm install
```

**If you get permission errors:**
- Close VS Code
- Right-click VS Code → "Run as administrator"
- Open your project again
- Try `npm install` again

### Step 2: Start Backend Server
After dependencies install, run:

```powershell
npm run dev
```

**You should see:**
```
Server running on port 3000
Socket.io server ready
```

### Step 3: Connect from Frontend
1. Go back to your browser
2. Click "Connect" button
3. It should work now! ✅

## Keep Both Running

- **Terminal 1**: Frontend (`npm run dev`) - Port 5174
- **Terminal 2**: Backend (`cd backend && npm run dev`) - Port 3000

**Both must be running at the same time!**

## Verify Backend is Running

Open in browser: `http://localhost:3000/health`

Should show: `{"status":"ok","timestamp":"..."}`

If you see "This site can't be reached" → Backend is NOT running.

