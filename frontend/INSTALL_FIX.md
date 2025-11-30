# Fix npm Installation Permission Error

## Problem
The `npm install` command is failing with `EPERM` (permission error) when trying to access the npm cache directory.

## Solutions (Try in order)

### Solution 1: Run VS Code as Administrator
1. Close VS Code completely
2. Right-click on VS Code icon
3. Select "Run as administrator"
4. Open your project folder
5. Try `npm install` again in the terminal

### Solution 2: Clear npm Cache
Run these commands in your terminal (you may need to run VS Code as administrator):

```bash
npm cache clean --force
npm install socket.io-client vue-router@4 pinia axios
```

### Solution 3: Change npm Cache Location
Run these commands to use a different cache location:

```bash
npm config set cache "C:\Users\YourUsername\AppData\Local\npm-cache" --global
npm install socket.io-client vue-router@4 pinia axios
```

### Solution 4: Install Packages One by One
Try installing packages individually:

```bash
npm install pinia
npm install vue-router@4
npm install socket.io-client
npm install axios
```

### Solution 5: Use PowerShell as Administrator
1. Open PowerShell as Administrator (right-click → Run as administrator)
2. Navigate to your project:
   ```powershell
   cd E:\Vue_app\first_vue_app
   ```
3. Run:
   ```powershell
   npm install socket.io-client vue-router@4 pinia axios
   ```

### Solution 6: Check Antivirus
Your antivirus might be blocking npm cache access. Temporarily disable it and try again.

## After Installation

Once packages are installed, you should be able to run:
```bash
npm run dev
```

And the error should be resolved!

