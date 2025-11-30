# Connection Troubleshooting Guide

## Issue: Cannot Connect to Chat

### Step 1: Check Backend Server
**Most Common Issue!**

1. Open a terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. You should see:
   ```
   Server running on port 3000
   Socket.io server ready
   ```

**If backend is NOT running, the frontend cannot connect!**

### Step 2: Check Environment Variables

Create a `.env` file in the root directory (same folder as `package.json`):
```
VITE_SOCKET_URL=http://localhost:3000
```

If the backend is on a different port, update accordingly.

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Connect" button
4. Look for these messages:

**Success messages:**
- "Connecting to: http://localhost:3000"
- "Connected to server"
- "Socket connected, setting isConnected to true"
- "Emitting user-join with: ..."

**Error messages:**
- "Connection error: ..." - Backend not running or wrong URL
- "Failed to create socket connection" - Socket.io client issue

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. You should see a WebSocket connection
4. Status should be "101 Switching Protocols" (connected)

### Step 5: Common Fixes

**Fix 1: Backend Not Running**
```bash
cd backend
npm install  # If dependencies not installed
npm run dev
```

**Fix 2: Wrong Port**
- Check backend is on port 3000
- Or update `.env` file with correct port

**Fix 3: CORS Issues**
- Backend should allow frontend origin
- Check `backend/src/server.js` CORS configuration

**Fix 4: Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Fix 5: Check Firewall**
- Ensure port 3000 is not blocked
- Try disabling firewall temporarily

### Step 6: Test Backend Directly

Open browser and go to:
```
http://localhost:3000/health
```

You should see:
```json
{"status":"ok","timestamp":"..."}
```

If this doesn't work, the backend is not running correctly.

### Quick Checklist

- [ ] Backend server is running (`cd backend && npm run dev`)
- [ ] Backend shows "Server running on port 3000"
- [ ] `.env` file exists with `VITE_SOCKET_URL=http://localhost:3000`
- [ ] Browser console shows "Connected to server"
- [ ] Network tab shows WebSocket connection
- [ ] No CORS errors in console
- [ ] Port 3000 is not blocked by firewall

### Still Not Working?

1. Check backend terminal for error messages
2. Check browser console for detailed error messages
3. Try restarting both backend and frontend
4. Verify socket.io-client is installed: `npm list socket.io-client`

