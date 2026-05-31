# Running Capital Project Execution & Governance Agent Locally

This guide will help you run the application on your local machine and connect it to any MREF instance.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **MREF/TRIRIGA Instance** with valid credentials
- **Network Access** to your MREF server (VPN if required)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rjbhavar/Capital-Project-Execution-Governance-Agent.git
cd Capital-Project-Execution-Governance-Agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:5173`

## Connecting to Your MREF Instance

### Option 1: Direct Connection (Recommended)

1. Launch the application
2. On the Connection Screen, enter:
   - **MREF Server URL**: Your full MREF URL (e.g., `https://your-server.com`)
   - **Username**: Your MREF username
   - **Password**: Your MREF password
   - **Environment**: Select appropriate environment (optional)
3. Click **"Connect to MREF"**

### Option 2: Demo Mode

If you don't have access to an MREF instance or want to explore the platform:

1. Click **"Try Demo Mode"** on the Connection Screen
2. Explore with sample data (no MREF connection required)

## Handling Self-Signed Certificates

If your MREF instance uses self-signed SSL certificates:

### For Development (Already Configured)

The application is pre-configured to accept self-signed certificates in development mode via the Vite proxy.

### For Production Deployment

You have two options:

**Option A: Install Proper SSL Certificate (Recommended)**
- Install a valid SSL certificate on your MREF server
- This is the most secure approach

**Option B: Browser Configuration**
- Navigate to your MREF URL directly in the browser
- Accept the security warning
- Then return to the application

## Network Configuration

### VPN Requirements

If your MREF instance is behind a VPN:

1. **Connect to VPN first** before launching the application
2. Verify connectivity: `ping your-mref-server.com`
3. Then launch the application

### Proxy Configuration

The application uses Vite's built-in proxy for development:

```javascript
// vite.config.js (already configured)
proxy: {
  '/api': {
    target: 'YOUR_MREF_URL',
    changeOrigin: true,
    secure: false, // Accepts self-signed certificates
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### CORS Issues

If you encounter CORS errors:

1. **Development**: The Vite proxy handles CORS automatically
2. **Production**: Configure CORS on your MREF server or use a reverse proxy

## Environment Variables (Optional)

Create a `.env` file for default connection settings:

```env
# Optional: Set default MREF URL for proxy
VITE_MREF_URL=https://your-mref-server.com

# Optional: Default credentials (NOT RECOMMENDED for production)
VITE_MREF_USERNAME=your_username
VITE_MREF_PASSWORD=your_password
```

**⚠️ Security Warning**: Never commit `.env` with real credentials to version control!

## Building for Production

### Build the Application

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Web Server

1. Copy contents of `dist/` to your web server
2. Configure your web server to:
   - Serve `index.html` for all routes (SPA routing)
   - Proxy `/api` requests to your MREF server
   - Handle CORS if needed

### Example: Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy to MREF
    location /api/ {
        proxy_pass https://your-mref-server.com/;
        proxy_ssl_verify off;  # For self-signed certs
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Connection Issues

**Problem**: "Cannot connect to MREF server"

**Solutions**:
1. Verify MREF URL is correct and accessible
2. Check VPN connection if required
3. Verify credentials are correct
4. Check browser console for detailed errors
5. Try Demo Mode to verify application works

### Self-Signed Certificate Errors

**Problem**: "SSL certificate error" or "NET::ERR_CERT_AUTHORITY_INVALID"

**Solutions**:
1. In development: Already handled by Vite proxy
2. In browser: Navigate to MREF URL directly and accept certificate
3. In production: Install proper SSL certificate on MREF server

### Loading Issues

**Problem**: Projects/Budgets tabs keep loading

**Solutions**:
1. Check browser console for API errors
2. Verify MREF credentials are correct
3. Check network tab for failed requests
4. Ensure MREF APIs are accessible
5. Try refreshing the connection

### CORS Errors

**Problem**: "CORS policy blocked" errors

**Solutions**:
1. Development: Ensure Vite dev server is running (proxy handles CORS)
2. Production: Configure CORS on MREF server or use reverse proxy
3. Check that `/api` proxy is configured correctly

### Session Expiration

**Problem**: "Session expired" errors

**Solutions**:
1. The application auto-recovers from session expiration
2. If it fails, disconnect and reconnect
3. Check MREF session timeout settings

## Development Tips

### Hot Module Replacement

The application uses Vite's HMR for instant updates:
- Edit any file
- Changes appear immediately without full reload
- State is preserved when possible

### Debug Mode

Enable detailed logging in browser console:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### API Testing

Test MREF APIs directly:

```bash
# Test connection
curl -k https://your-mref-server.com/oslc/spq

# Test authentication
curl -k -X POST https://your-mref-server.com/p/websignon/signon \
  -H "Content-Type: application/json" \
  -d '{"userName":"your_username","password":"your_password"}'
```

## Performance Optimization

### Production Build Optimization

The build is already optimized with:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

### Caching Strategy

The application caches:
- Project data (refreshable)
- Connection state (session storage)
- Agent memory (session storage)

Clear cache if needed:
```javascript
// In browser console
sessionStorage.clear();
localStorage.clear();
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use HTTPS** in production
3. **Implement proper authentication** on your web server
4. **Keep dependencies updated**: `npm audit fix`
5. **Use environment variables** for sensitive configuration
6. **Enable CORS** only for trusted domains
7. **Implement rate limiting** on your MREF server

## Getting Help

### Check Logs

1. **Browser Console**: Press F12 → Console tab
2. **Network Tab**: Press F12 → Network tab
3. **Vite Server**: Check terminal where `npm run dev` is running

### Common Log Messages

- `🔌 MREFConnector: Connected successfully` - Connection OK
- `❌ Authentication failed` - Check credentials
- `⚠️ JSESSIONID not found` - Session issue
- `📡 Fetching capital projects` - Loading data

### Report Issues

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify MREF server is accessible
4. Try Demo Mode to isolate the issue
5. Create an issue on GitHub with:
   - Error message
   - Browser console logs
   - Steps to reproduce

## Additional Resources

- **MREF Documentation**: Consult your MREF administrator
- **OSLC API Reference**: Check MREF API documentation
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev

## Support

For questions or issues:
- GitHub Issues: https://github.com/rjbhavar/Capital-Project-Execution-Governance-Agent/issues
- Email: Contact your system administrator

---

**Made with Bob** 🤖