# How to Start the Backend Server

## Quick Start

1. **Open a NEW terminal window** (keep your frontend running in the current terminal)

2. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **You should see:**
   ```
   Server running on port 3000
   Socket.io server ready
   ```

## Important Notes

- **Keep the backend terminal open** - Don't close it while using the chat app
- The backend must be running **before** you can connect from the frontend
- Backend runs on port 3000
- Frontend runs on port 5174 (or 5173)

## Troubleshooting

### If `npm install` fails:
- Try running PowerShell as Administrator
- Or use: `npm install --force`

### If port 3000 is already in use:
- Change the port in `backend/src/server.js` (line with `PORT`)
- Update `.env` file with new port

### To stop the backend:
- Press `Ctrl+C` in the backend terminal

## Verify Backend is Running

Open in browser: `http://localhost:3000/health`

You should see: `{"status":"ok","timestamp":"..."}`

