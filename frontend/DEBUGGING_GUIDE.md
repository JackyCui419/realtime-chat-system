# Debugging Chat Messages Not Showing

## Steps to Debug

1. **Check if Backend is Running**
   - Open terminal and run: `cd backend && npm run dev`
   - You should see: "Server running on port 3000"
   - If not, the backend isn't running!

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for these messages:
     - "Connected to server" - Socket connected
     - "Sending message: ..." - Message being sent
     - "Received message: ..." - Message received from server
     - "Filtering messages..." - Messages being filtered

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - You should see a WebSocket connection to `localhost:3000`
   - Check if it's connected (should show "101 Switching Protocols")

4. **Common Issues**

   **Issue: Backend not running**
   - Solution: Start backend with `cd backend && npm run dev`

   **Issue: Socket not connected**
   - Check console for "Connection error"
   - Verify `VITE_SOCKET_URL=http://localhost:3000` in `.env` file
   - Check if backend is on port 3000

   **Issue: Messages sent but not received**
   - Check console logs for "Sending message" and "Received message"
   - If "Sending" appears but not "Received", backend might not be processing
   - Check backend terminal for error messages

   **Issue: Messages received but not displayed**
   - Check console for "Filtering messages" logs
   - Verify `roomId` matches `currentRoom`
   - Check if messages array is being populated

5. **Test Steps**
   - Open two browser tabs/windows
   - Connect both with different usernames
   - Send a message from one
   - Check if it appears in both windows
   - Check console logs in both windows

## Expected Console Output

When working correctly, you should see:
```
Connected to server
Received available rooms: [...]
Sending message: { message: "test", roomId: "general", ... }
Received message: { id: "...", message: "test", roomId: "general", ... }
Filtering messages - currentRoom: general, total messages: 1, filtered: 1
```

## Quick Fixes

1. **Restart Backend**: Stop and restart the backend server
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
3. **Check .env File**: Ensure `VITE_SOCKET_URL` is set correctly
4. **Check Port**: Ensure backend is on port 3000 and frontend can access it

