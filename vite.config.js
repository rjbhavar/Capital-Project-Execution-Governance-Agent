import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get MREF URL from environment variable or use default
const MREF_TARGET = process.env.VITE_MREF_URL || 'https://semas.facilities.semas.apps.srvengmas.cp.fyre.ibm.com';

console.log('🔧 Vite Proxy Target:', MREF_TARGET);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: MREF_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        cookieDomainRewrite: 'localhost',
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              console.log('🍪 Original Set-Cookie from MREF:', setCookie);
              
              // Modify cookies to work with localhost
              const modifiedCookies = Array.isArray(setCookie)
                ? setCookie.map(cookie => {
                    // Remove Secure, modify Domain and SameSite for localhost
                    let modified = cookie
                      .replace(/; Secure/gi, '')
                      .replace(/; Domain=[^;]+/gi, '; Domain=localhost')
                      .replace(/; SameSite=None/gi, '; SameSite=Lax')
                      .replace(/; Path=\//gi, '; Path=/');
                    
                    return modified;
                  })
                : [setCookie
                    .replace(/; Secure/gi, '')
                    .replace(/; Domain=[^;]+/gi, '; Domain=localhost')
                    .replace(/; SameSite=None/gi, '; SameSite=Lax')
                    .replace(/; Path=\//gi, '; Path=/')];
              
              proxyRes.headers['set-cookie'] = modifiedCookies;
              console.log('✅ Modified Set-Cookie for browser:', modifiedCookies);
            }
          });
          
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxying:', req.method, req.url);
          });
          
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err.message);
          });
        }
      }
    }
  }
})

// Made with Bob
