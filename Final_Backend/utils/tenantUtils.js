// Tenant Utility Functions
// ========================
// Helper functions for tenant-aware operations

const { query } = require('../config/db');

/**
 * Add tenant_id to WHERE clause for queries
 */
const addTenantFilter = (baseQuery, tenantId, paramStartIndex = 1) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-aware queries');
  }
  
  const whereClause = baseQuery.toLowerCase().includes('where') 
    ? ` AND tenant_id = $${paramStartIndex}`
    : ` WHERE tenant_id = $${paramStartIndex}`;
  
  return baseQuery + whereClause;
};

/**
 * Execute tenant-aware query
 */
const tenantQuery = async (sql, params = [], tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-aware queries');
  }
  
  // Add tenant_id as the first parameter
  return await query(sql, [tenantId, ...params]);
};

/**
 * Validate tenant access for a resource
 */
const validateTenantAccess = async (resourceType, resourceId, tenantId) => {
  const tableMap = {
    'restaurant': 'Restaurants',
    'menu_item': 'MenuItems', 
    'order': 'Orders',
    'rider': 'Riders',
    'review': 'RatingsAndReviews',
    'branch': 'Branches'
  };
  
  const table = tableMap[resourceType];
  if (!table) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }
  
  const idColumn = resourceType === 'menu_item' ? 'menu_item_id' : `${resourceType}_id`;
  
  const result = await query(
    `SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = $1 AND tenant_id = $2`,
    [resourceId, tenantId]
  );
  
  return result.rows.length > 0;
};

/**
 * Get tenant limits from subscription
 */
const getTenantLimits = async (tenantId) => {
  const result = await query(`
    SELECT 
      sp.max_restaurants,
      sp.max_orders_per_month,
      sp.max_riders,
      sp.max_menu_items,
      sp.features
    FROM TenantSubscriptions ts
    JOIN SubscriptionPlans sp ON sp.plan_id = ts.plan_id
    WHERE ts.tenant_id = $1 AND ts.status = 'active'
    ORDER BY ts.created_at DESC
    LIMIT 1
  `, [tenantId]);
  
  return result.rows[0] || {
    max_restaurants: 1,
    max_orders_per_month: 100,
    max_riders: 3,
    max_menu_items: 50,
    features: {}
  };
};

/**
 * Check if tenant has reached a specific limit
 */
const checkTenantLimit = async (tenantId, limitType) => {
  const limits = await getTenantLimits(tenantId);
  const limit = limits[`max_${limitType}`];
  
  if (limit === -1) {
    return { allowed: true, current: null, limit: 'unlimited' };
  }
  
  let currentCount = 0;
  
  switch (limitType) {
    case 'restaurants':
      const restaurantResult = await query(
        'SELECT COUNT(*) as count FROM Restaurants WHERE tenant_id = $1',
        [tenantId]
      );
      currentCount = parseInt(restaurantResult.rows[0].count);
      break;
      
    case 'orders_per_month':
      const orderResult = await query(`
        SELECT COUNT(*) as count FROM Orders 
        WHERE tenant_id = $1 
        AND created_at >= date_trunc('month', CURRENT_DATE)
      `, [tenantId]);
      currentCount = parseInt(orderResult.rows[0].count);
      break;
      
    case 'riders':
      const riderResult = await query(
        'SELECT COUNT(*) as count FROM Riders WHERE tenant_id = $1',
        [tenantId]
      );
      currentCount = parseInt(riderResult.rows[0].count);
      break;
      
    case 'menu_items':
      const menuResult = await query(
        'SELECT COUNT(*) as count FROM MenuItems WHERE tenant_id = $1',
        [tenantId]
      );
      currentCount = parseInt(menuResult.rows[0].count);
      break;
  }
  
  return {
    allowed: currentCount < limit,
    current: currentCount,
    limit: limit
  };
};

/**
 * Ensure user has access to tenant
 */
const ensureTenantAccess = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_TENANT_CONTEXT',
        message: 'Tenant context is required',
        statusCode: 400
      }
    });
  }
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
        statusCode: 401
      }
    });
  }
  
  // Platform admins bypass tenant access checks
  if (req.user.is_platform_admin) {
    return next();
  }
  
  if (!req.userTenantRole) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Access denied to this tenant',
        statusCode: 403
      }
    });
  }
  
  next();
};

/**
 * Add tenant_id to request body for create operations
 */
const addTenantToBody = (req, res, next) => {
  if (req.tenant && req.method === 'POST') {
    req.body.tenant_id = req.tenant.tenant_id;
  }
  next();
};

/**
 * Standard tenant-aware response format
 */
const tenantResponse = (res, data, message = 'Success', code = 'SUCCESS') => {
  return res.json({
    success: true,
    message,
    data,
    code,
    tenant: res.req?.tenant ? {
      id: res.req.tenant.tenant_id,
      name: res.req.tenant.name,
      subdomain: res.req.tenant.subdomain
    } : null
  });
};

/**
 * Standard tenant-aware error response
 */
const tenantErrorResponse = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode
    },
    tenant: res.req?.tenant ? {
      id: res.req.tenant.tenant_id,
      name: res.req.tenant.name,
      subdomain: res.req.tenant.subdomain
    } : null
  });
};

module.exports = {
  addTenantFilter,
  tenantQuery,
  validateTenantAccess,
  getTenantLimits,
  checkTenantLimit,
  ensureTenantAccess,
  addTenantToBody,
  tenantResponse,
  tenantErrorResponse
};