// SaaS Billing Routes
// ===================
const express = require('express');
const billingController = require('../controllers/billingController');
const { authMiddleware, platformAdminOnly } = require('../middlewares/authMiddleware');
const { tenantContext, requireTenant, requireTenantRole } = require('../middlewares/tenantMiddleware');

const router = express.Router();

// =============================================================================
// WEBHOOK ROUTES (No authentication - external webhooks)
// =============================================================================

// Chapa webhook endpoint (must be publicly accessible)
router.post('/webhook', billingController.handleWebhook);

// =============================================================================
// PUBLIC BILLING ROUTES
// =============================================================================

// Verify payment (can be called from frontend after redirect)
router.get('/verify/:tx_ref', billingController.verifyPayment);

// =============================================================================
// TENANT-SCOPED BILLING ROUTES
// =============================================================================

// Apply authentication and tenant context
router.use(authMiddleware, tenantContext, requireTenant);

// Get current tenant billing information
router.get(
  '/tenant/current', 
  requireTenantRole(['tenant_admin', 'manager']), 
  billingController.getTenantBilling
);

// Initialize subscription payment
router.post(
  '/tenant/subscribe', 
  requireTenantRole(['tenant_admin']), 
  billingController.initializeSubscriptionPayment
);

// Cancel subscription
router.post(
  '/tenant/cancel', 
  requireTenantRole(['tenant_admin']), 
  billingController.cancelSubscription
);

// =============================================================================
// PLATFORM ADMIN ROUTES
// =============================================================================

// Platform revenue analytics (platform admin only)
router.get(
  '/platform/revenue', 
  platformAdminOnly, 
  billingController.getPlatformRevenue
);

module.exports = router;