# 🚀 Multi-Tenant SaaS Food Delivery Platform - Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)  
3. [Database Setup](#database-setup)
4. [Backend Configuration](#backend-configuration)
5. [Running Migrations](#running-migrations)
6. [Frontend Configuration](#frontend-configuration)
7. [Domain Setup](#domain-setup)
8. [Payment Integration](#payment-integration)
9. [Testing](#testing)
10. [Production Deployment](#production-deployment)
11. [Monitoring & Maintenance](#monitoring--maintenance)

## 🎯 Overview

This guide helps you deploy a complete multi-tenant SaaS food delivery platform with:

- **Multi-Tenancy**: Isolated tenant data with subdomain routing
- **SaaS Billing**: Chapa payment integration with subscription plans
- **RBAC**: Role-based access control with tenant-scoped permissions
- **Real-time Features**: Socket.io with tenant namespaces
- **Admin Dashboard**: Platform management interface
- **Restaurant Portals**: Tenant-specific management interfaces
- **Mobile Apps**: React Native customer and rider apps

## ✅ Prerequisites

### System Requirements
- **Node.js**: >= 16.x
- **PostgreSQL**: >= 12.x
- **Redis**: >= 6.x (for caching and sessions)
- **Git**: For version control

### Development Tools
- **VS Code** (recommended)
- **pgAdmin** or **DBeaver** (database management)
- **Postman** (API testing)
- **React Developer Tools**

### Accounts Needed
- **Chapa Account**: For payment processing
- **Domain**: For multi-tenant subdomains (e.g., `yourdomain.com`)
- **Email Service**: SMTP for notifications (Gmail, SendGrid, etc.)

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE Food_Delivery;
CREATE USER food_delivery_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE Food_Delivery TO food_delivery_user;

-- Connect to the Food_Delivery database
\c Food_Delivery;

-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO food_delivery_user;
GRANT CREATE ON SCHEMA public TO food_delivery_user;
```

### 2. Configure Database Connection

Update `Final_Backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Food_Delivery
DB_USER=food_delivery_user
DB_PASSWORD=your_secure_password
```

### 3. Test Database Connection

```bash
cd "Final_Backend"
node test-db.js
```

## ⚙️ Backend Configuration

### 1. Install Dependencies

```bash
cd "Final_Backend"
npm install
```

### 2. Environment Configuration

Copy and configure your environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Food_Delivery
DB_USER=food_delivery_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars

# Server Configuration
PORT=5000
NODE_ENV=development

# SaaS Multi-Tenant Configuration
MASTER_DOMAIN=yourdomain.com
FRONTEND_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:5173
RESTAURANT_PANEL_URL=http://localhost:5174

# Chapa Payment Configuration
CHAPA_URL=https://api.chapa.co/v1
CHAPA_AUTH=your_chapa_secret_key
CHAPA_RETURN_URL=http://localhost:3000/billing/success
CHAPA_CALLBACK_URL=http://localhost:5000/api/billing/webhook
CHAPA_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Feature Flags
ENABLE_MULTI_TENANT=true
ENABLE_SAAS_BILLING=true
ENABLE_AUDIT_LOGGING=true
```

## 🔄 Running Migrations

### 1. Full SaaS Setup (Recommended)

This command runs all migrations in the correct order:

```bash
npm run setup-saas
```

### 2. Manual Migration Steps

If you prefer to run migrations manually:

```bash
# Step 1: Create SaaS tables
node migrate.js run 001_create_saas_multitenant_schema.sql

# Step 2: Add tenant_id to existing tables
node migrate.js run 002_add_tenant_id_to_existing_tables.sql

# Step 3: Validate migration
node migrate.js validate

# Step 4: Check status
node migrate.js status
```

### 3. Migration Verification

After running migrations, verify the setup:

```bash
# Check database status
node migrate.js status

# Validate migration results
node migrate.js validate
```

Expected output:
```
✅ Tenants table exists
✅ Default tenant created
📊 Tables with tenant_id columns:
   - restaurants
   - branches
   - menuitems
   - orders
   - orderitems
   - riders
   - ratingsandreviews
```

## 🎨 Frontend Configuration

### 1. Admin Panel Setup

```bash
cd "Admin Panel/admin_panel"
npm install

# Update .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_APP_NAME=Food Delivery Admin Panel" >> .env

# Start development server
npm run dev
```

### 2. Restaurant Panel Setup

```bash
cd "Restaurant Panel/restaurant_panel"
npm install

# Update .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_APP_NAME=Restaurant Management Portal" >> .env

# Start development server
npm run dev
```

### 3. Customer App (React Native)

```bash
cd client
npm install

# For iOS
npm run ios

# For Android
npm run android
```

### 4. Rider App (React Native)

```bash
cd rider
npm install

# For iOS
npm run ios

# For Android
npm run android
```

## 🌐 Domain Setup

### Development Setup

For local development, add these entries to your hosts file:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**macOS/Linux**: `/etc/hosts`

```
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 pizzahut.localhost
127.0.0.1 kfc.localhost
127.0.0.1 subway.localhost
```

### Production DNS Setup

For production, configure DNS records:

```
# A Records
yourdomain.com        -> Your_Server_IP
*.yourdomain.com      -> Your_Server_IP

# CNAME Records (alternative)
admin.yourdomain.com  -> yourdomain.com
api.yourdomain.com    -> yourdomain.com
```

## 💳 Payment Integration

### 1. Chapa Setup

1. **Create Chapa Account**: Visit [chapa.co](https://chapa.co)
2. **Get API Keys**: 
   - Test Key: `CHASECK_TEST-xxxxx`
   - Live Key: `CHASECK-xxxxx`
3. **Configure Webhooks**:
   - Webhook URL: `https://yourdomain.com/api/billing/webhook`
   - Events: `charge.success`, `charge.failed`

### 2. Test Payment Flow

```bash
# Start backend
cd "Final_Backend"
npm run dev

# Test payment initialization
curl -X POST http://localhost:5000/api/billing/tenant/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan_id": 1,
    "billing_cycle": "monthly"
  }'
```

## 🧪 Testing

### 1. Backend API Testing

```bash
cd "Final_Backend"

# Test basic connectivity
node test-api.js

# Test database
node test-db.js
```

### 2. Multi-Tenant Testing

#### Create Test Tenant

```bash
curl -X POST http://localhost:5000/api/tenants/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pizza Shop",
    "subdomain": "testpizza",
    "contact_email": "admin@testpizza.com",
    "contact_phone": "+1234567890",
    "subscription_plan": "trial",
    "admin_name": "Test Admin",
    "admin_email": "admin@testpizza.com",
    "admin_password": "TestPass123!",
    "admin_phone": "+1234567890"
  }'
```

#### Test Tenant Isolation

```bash
# Login to tenant
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: testpizza" \
  -d '{
    "email": "admin@testpizza.com",
    "password": "TestPass123!"
  }'

# Test tenant-scoped API
curl -X GET http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-ID: testpizza"
```

### 3. Frontend Testing

1. **Admin Panel**: `http://localhost:5173`
   - Login with platform admin credentials
   - Test tenant management
   - Verify billing integration

2. **Restaurant Panel**: `http://localhost:5174`
   - Login with tenant admin credentials
   - Test restaurant management
   - Verify tenant isolation

## 🚀 Production Deployment

### 1. Server Setup

#### Using Docker (Recommended)

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: Food_Delivery
      POSTGRES_USER: food_delivery_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. Environment Configuration

Create production `.env`:

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_super_secure_jwt_secret_64_chars_minimum

# Domains
MASTER_DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com
ADMIN_PANEL_URL=https://admin.yourdomain.com

# Chapa Production
CHAPA_AUTH=CHASECK-your_live_key
CHAPA_RETURN_URL=https://yourdomain.com/billing/success
CHAPA_CALLBACK_URL=https://yourdomain.com/api/billing/webhook

# Email Production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### 3. Deploy & Start

```bash
# Deploy to server
git clone your-repo.git
cd your-project
npm ci --only=production

# Run migrations
npm run setup-saas

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name food-delivery-api
pm2 startup
pm2 save
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/food-delivery
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com *.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Monitoring & Maintenance

### 1. Health Checks

```bash
# API Health
curl https://yourdomain.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0-saas",
  "features": ["multi-tenant", "saas-billing", "rbac"]
}
```

### 2. Logging Setup

```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h your_db_host -U your_db_user Food_Delivery > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 4. Monitoring Metrics

Key metrics to monitor:
- **API Response Times**
- **Database Connections**
- **Active Tenants**
- **Subscription Revenue**
- **Error Rates**
- **Memory & CPU Usage**

## 🔧 Troubleshooting

### Common Issues

#### 1. Migration Fails
```bash
# Check database connection
node test-db.js

# Check for existing tables
psql -d Food_Delivery -c "\dt"

# Rollback if needed
node migrate.js rollback
```

#### 2. Tenant Context Missing
- Verify tenant middleware is applied
- Check subdomain configuration
- Validate JWT token contains tenant info

#### 3. Payment Webhook Issues
- Verify webhook URL is accessible
- Check Chapa webhook signature
- Review webhook logs

#### 4. Frontend Can't Connect to API
- Check CORS configuration
- Verify API base URL
- Test with curl/Postman first

### Debug Commands

```bash
# Check API connectivity
curl -v http://localhost:5000/health

# Test tenant resolution
curl -H "X-Tenant-ID: testpizza" http://localhost:5000/api/tenants/current

# Verify database tables
psql -d Food_Delivery -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"

# Check migration status
node migrate.js status
```

## 🎉 Success!

Your multi-tenant SaaS food delivery platform is now ready! 

### Next Steps

1. **Create Your First Tenant**
2. **Set Up Custom Branding**
3. **Configure Payment Plans**
4. **Launch Mobile Apps**
5. **Monitor & Scale**

### Support

For technical support or questions:
- 📧 Email: support@yourdomain.com
- 📚 Docs: https://docs.yourdomain.com
- 💬 Discord: https://discord.gg/yourserver

---

**Congratulations! You've successfully deployed a production-ready multi-tenant SaaS food delivery platform! 🚀**