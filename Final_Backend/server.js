const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderroutes'); // Note: actual file is orderroutes.js
const orderItemRoutes = require('./routes/orderItemRoutes');
const riderRoutes = require('./routes/riderRoutes');
const ratingsAndReviewsRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chapaRoutes = require('./routes/chapaRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const earningRoutes = require('./routes/earningRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const branchRoutes = require('./routes/branchRoutes');

// Import new SaaS routes
const tenantRoutes = require('./routes/tenantRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');
const { tenantContext } = require('./middlewares/tenantMiddleware');

// Configure Multer with limits
const upload = multer({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50 MB limit
  }
});

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Global tenant context middleware (optional - adds tenant context if available)
app.use('/api', (req, res, next) => {
  // Skip tenant context for certain routes
  const skipTenantRoutes = [
    '/api/tenants/onboard',
    '/api/tenants/check-subdomain',
    '/api/tenants/plans',
    '/api/billing/webhook',
    '/api/billing/verify'
  ];
  
  if (skipTenantRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Apply tenant context for other routes
  tenantContext(req, res, next);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-saas',
    features: ['multi-tenant', 'saas-billing', 'rbac']
  });
});
  
// SaaS Routes (New)
app.use('/api/tenants', tenantRoutes);
app.use('/api/billing', billingRoutes);

// Legacy Routes (with tenant context)
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/rating-reviews', ratingsAndReviewsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chapa', chapaRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/branches', branchRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Multi-Tenant SaaS Food Delivery API Server`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏢 Multi-Tenant: Enabled`);
  console.log(`💳 SaaS Billing: Enabled`);
  console.log(`🔐 RBAC: Enabled`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🏗️  Ready for multi-tenant operations!`);
});