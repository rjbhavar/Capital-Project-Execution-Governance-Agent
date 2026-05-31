# Deployment Guide - Capital Project Management Platform

## Overview

This guide provides step-by-step instructions for deploying the Capital Project Management Platform to production.

## Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All core services implemented
- [x] All agents implemented
- [x] Build passes successfully
- [x] No console errors in development
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing

### ✅ Configuration
- [ ] Environment variables configured
- [ ] MREF endpoints configured
- [ ] Authentication credentials set
- [ ] Email/SMS services configured (optional)
- [ ] Monitoring tools configured

### ✅ Security
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] SSL certificates installed
- [ ] CORS policies configured
- [ ] Rate limiting configured

## Deployment Steps

### 1. Environment Configuration

Create production environment file `.env.production`:

```env
# MREF Configuration
VITE_MREF_BASE_URL=https://your-production-mref.com
VITE_MREF_USERNAME=production-user
VITE_MREF_PASSWORD=secure-password

# Application Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_SMS_NOTIFICATIONS=false
VITE_ENABLE_PUSH_NOTIFICATIONS=false

# Monitoring
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### 2. MREF Integration

Update `src/services/oslc.js`:

```javascript
// Change mock flag to false
this.useMock = false;
```

Verify all endpoint URLs are correct:
- `/oslc/spq/cstCapitalProjectQC`
- `/oslc/spq/cstBudgetQC`
- `/oslc/spq/cstContractQC`
- etc.

### 3. Build for Production

```bash
# Clean previous builds
rm -rf dist/

# Build production bundle
npm run build

# Verify build output
ls -lh dist/
```

Expected output:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── ...
```

### 4. Test Production Build Locally

```bash
# Preview production build
npm run preview

# Test in browser
open http://localhost:4173
```

Verify:
- [ ] Application loads correctly
- [ ] All pages accessible
- [ ] No console errors
- [ ] MREF connection works
- [ ] Authentication works
- [ ] Data loads correctly

### 5. Deploy to Hosting Service

#### Option A: Static Hosting (Netlify, Vercel, etc.)

```bash
# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy to Vercel
vercel --prod
```

#### Option B: Traditional Server (Nginx, Apache)

```bash
# Copy build to server
scp -r dist/* user@server:/var/www/capital-project-platform/

# Configure Nginx
sudo nano /etc/nginx/sites-available/capital-project-platform
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/capital-project-platform;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Option C: Docker Container

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and deploy:
```bash
# Build Docker image
docker build -t capital-project-platform:1.0.0 .

# Run container
docker run -d -p 80:80 capital-project-platform:1.0.0

# Or push to registry
docker push your-registry/capital-project-platform:1.0.0
```

### 6. Configure SSL/TLS

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com

# Verify SSL configuration
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Set Up Monitoring

#### Application Monitoring

Configure monitoring service (e.g., Datadog, New Relic):

```javascript
// Add to src/main.jsx
import { initMonitoring } from './monitoring';

if (import.meta.env.PROD) {
  initMonitoring({
    apiKey: import.meta.env.VITE_MONITORING_API_KEY,
    environment: 'production'
  });
}
```

#### Error Tracking

Configure error tracking (e.g., Sentry):

```javascript
// Add to src/main.jsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0
  });
}
```

### 8. Configure Backup Strategy

```bash
# Database backups (if applicable)
# Set up automated backups for audit logs, user data, etc.

# Code backups
# Ensure Git repository is backed up
# Tag release version
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

### 9. Set Up CI/CD Pipeline

Example GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_MREF_BASE_URL: ${{ secrets.MREF_BASE_URL }}
          
      - name: Deploy
        run: |
          # Deploy to your hosting service
          # Example: netlify deploy --prod --dir=dist
```

### 10. Post-Deployment Verification

#### Smoke Tests

```bash
# Test critical endpoints
curl https://your-domain.com/
curl https://your-domain.com/api/health

# Test authentication
# Test data loading
# Test agent execution
```

#### Performance Testing

```bash
# Run Lighthouse audit
lighthouse https://your-domain.com --view

# Run load tests
# Use tools like Apache Bench, k6, or Artillery
```

#### Security Testing

```bash
# Run security scan
npm audit

# Check SSL configuration
ssllabs.com/ssltest/analyze.html?d=your-domain.com

# Verify CORS policies
# Verify CSP headers
```

## Post-Deployment Tasks

### 1. User Training
- [ ] Conduct user training sessions
- [ ] Provide documentation
- [ ] Set up support channels

### 2. Monitoring Setup
- [ ] Configure alerts for errors
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation

### 3. Documentation
- [ ] Update deployment documentation
- [ ] Document configuration changes
- [ ] Create runbook for common issues
- [ ] Document rollback procedures

### 4. Backup Verification
- [ ] Verify backup procedures
- [ ] Test restore procedures
- [ ] Document backup locations

## Rollback Procedure

If issues are detected after deployment:

```bash
# 1. Identify the issue
# Check logs, monitoring dashboards

# 2. Rollback to previous version
git checkout v0.9.0  # Previous stable version
npm run build
# Deploy previous build

# 3. Investigate issue
# Review logs, error reports

# 4. Fix and redeploy
# Fix the issue
# Test thoroughly
# Deploy again
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check system health
- Review audit logs

**Weekly:**
- Review performance metrics
- Check for security updates
- Review user feedback

**Monthly:**
- Update dependencies
- Review and optimize performance
- Conduct security audit
- Review backup procedures

### Scaling Considerations

As usage grows, consider:

1. **CDN Integration**
   - Serve static assets from CDN
   - Reduce server load
   - Improve global performance

2. **Load Balancing**
   - Distribute traffic across multiple servers
   - Improve reliability
   - Handle increased load

3. **Caching Strategy**
   - Implement Redis for session storage
   - Cache API responses
   - Optimize database queries

4. **Database Optimization**
   - Index frequently queried fields
   - Implement read replicas
   - Optimize slow queries

## Troubleshooting

### Common Issues

**Issue: Application won't load**
- Check browser console for errors
- Verify MREF connection
- Check network requests
- Verify environment variables

**Issue: Authentication fails**
- Verify MREF credentials
- Check session configuration
- Review CORS settings
- Check authentication logs

**Issue: Slow performance**
- Check network latency
- Review bundle size
- Optimize images and assets
- Enable compression

**Issue: Agent execution fails**
- Check agent logs
- Verify MREF data availability
- Review error messages
- Check circuit breaker status

## Support Contacts

- **Technical Support**: support@example.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX
- **Documentation**: https://docs.example.com

## Conclusion

Following this deployment guide ensures a smooth transition to production. Always test thoroughly before deploying and maintain proper monitoring and backup procedures.

---

**Last Updated**: 2026-05-31
**Version**: 1.0.0