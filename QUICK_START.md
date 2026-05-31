# Quick Start Guide

## 🚀 Running the Application

### Option 1: With Real MREF Connection

1. **Set MREF URL in .env file:**
   ```bash
   VITE_MREF_URL=https://your-mref-instance.com
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open browser to:** http://localhost:5173

4. **Enter credentials:**
   - MREF Server URL: `https://semas.facilities.semas.apps.srvengmas.cp.fyre.ibm.com`
   - Username: Your MREF username
   - Password: Your MREF password
   - Click "Connect to MREF"

### Option 2: Demo Mode (No MREF Required)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser to:** http://localhost:5173

3. **Click "Try Demo Mode"** button at the bottom of the connection screen

4. **Explore the platform** with sample data

---

## 🔧 How It Works

### Development Mode (with Proxy)
- The app uses Vite's proxy to avoid CORS issues
- All API calls go through `/api` which proxies to your MREF instance
- Cookies are automatically handled by the proxy
- **Note:** You must restart the dev server if you change `VITE_MREF_URL` in .env

### Production Mode
- The app connects directly to the MREF instance
- No proxy needed
- CORS must be configured on the MREF server

---

## 🐛 Troubleshooting

### Connection Failed Error

**Possible causes:**
1. **CORS Issue** - Use Demo Mode or ensure proxy is configured
2. **VPN Not Connected** - Connect to VPN if required
3. **Wrong URL** - Verify the MREF URL is correct
4. **Server Not Accessible** - Check if server is running

**Solution:**
- Try Demo Mode to explore the platform
- Verify .env file has correct VITE_MREF_URL
- Restart dev server after changing .env
- Check VPN connection

### Proxy Not Working

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Update VITE_MREF_URL in .env file
3. Restart: `npm run dev`

---

## 📝 Notes

- **Demo Mode** uses mock data and doesn't require MREF connection
- **Real Mode** requires valid MREF credentials and network access
- The proxy only works in development mode
- For production deployment, configure CORS on MREF server

---

## 🎯 Current Configuration

Your .env file is configured for:
```
VITE_MREF_URL=https://semas.facilities.semas.apps.srvengmas.cp.fyre.ibm.com
```

This is an IBM Fyre environment. Make sure you have:
- ✅ VPN connected (if required)
- ✅ Valid credentials
- ✅ Network access to the server

---

**Made with Bob** 🤖