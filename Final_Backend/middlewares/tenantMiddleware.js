// Multi-Tenant Context Middleware
// ===============================
// This middleware handles tenant discovery and isolation for the SaaS platform

const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Tenant Discovery Strategy
 * 1. Check subdomain (e.g., pizzahut.fooddelivery.com)
 * 2. Check custom domain (e.g., orders.pizzahut.com) 
 * 3. Check X-Tenant-ID header
 * 4. Check tenant_id in JWT token
 * 5. Fall back to default tenant for backward compatibility
 */

class TenantContextError extends Error {
  constructor(message, code = 'TENANT_ERROR') {
    super(message);
    this.name = 'TenantContextError';
    this.code = code;
  }
}

/**
 * Extract tenant identifier from various sources
 */
const extractTenantIdentifier = (req) => {
  // 1. Check X-Tenant-ID header (for API clients)
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId) {
    return { type: 'header', value: headerTenantId };
  }

  // 2. Check subdomain (e.g., pizzahut.fooddelivery.com)
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  // Skip extraction for localhost and IP addresses in development
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('::1');
  
  if (!isDevelopment && !isLocalhost && subdomain && subdomain !== 'www' && subdomain !== 'api') {
    return { type: 'subdomain', value: subdomain };
  }

  // 3. Check for custom domain mapping
  if (!isLocalhost) {
    return { type: 'domain', value: host };
  }

  // 4. Check JWT token for tenant_id (if user is authenticated)
  if (req.user && req.user.tenant_id) {
    return { type: 'jwt', value: req.user.tenant_id };
  }

  return null;
};

/**
 * Resolve tenant from identifier
 */
const resolveTenant = async (identifier) => {
  if (!identifier) {
    return null;
  }

  let tenant = null;

  try {
    switch (identifier.type) {
      case 'header':
      case 'jwt':
        // Direct tenant_id lookup
        const tenantResult = await query(
          'SELECT * FROM Tenants WHERE tenant_id = $1 AND status = $2',
          [identifier.value, 'active']
        );
        tenant = tenantResult.rows[0];
        break;

      case 'subdomain':
        // Subdomain lookup
        const subdomainResult = await query(
          'SELECT * FROM Tenants WHERE subdomain = $1 AND status = $2',
          [identifier.value, 'active']
        );
        tenant = subdomainResult.rows[0];
        break;

      case 'domain':
        // Custom domain lookup
        const domainResult = await query(
          'SELECT * FROM Tenants WHERE custom_domain = $1 AND status = $2',
          [identifier.value, 'active']
        );
        tenant = domainResult.rows[0];
        break;
    }
  } catch (error) {
    console.error('Error resolving tenant:', error);
    throw new TenantContextError('Failed to resolve tenant', 'TENANT_RESOLUTION_ERROR');
  }

  return tenant;
};

/**
 * Check if user has access to the tenant
 */
const checkTenantAccess = async (userId, tenantId) => {
  if (!userId || !tenantId) {
    return false;
  }

  try {
    const accessResult = await query(`
      SELECT ut.*, u.role as global_role, u.is_platform_admin
      FROM UserTenants ut
      JOIN Users u ON u.user_id = ut.user_id
      WHERE ut.user_id = $1 AND ut.tenant_id = $2 AND ut.status = 'active'
    `, [userId, tenantId]);

    if (accessResult.rows.length > 0) {
      return accessResult.rows[0];
    }

    // Check if user is platform admin (has access to all tenants)
    const userResult = await query(
      'SELECT is_platform_admin FROM Users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows[0]?.is_platform_admin) {
      return { 
        tenant_role: 'platform_admin', 
        global_role: 'platform_admin',
        is_platform_admin: true 
      };
    }

    return false;
  } catch (error) {
    console.error('Error checking tenant access:', error);
    return false;
  }
};

/**
 * Main tenant context middleware
 */
const tenantContext = async (req, res, next) => {
  try {
    // Extract tenant identifier
    const identifier = extractTenantIdentifier(req);
    
    // Resolve tenant
    let tenant = null;
    if (identifier) {
      tenant = await resolveTenant(identifier);
    }

    // Fall back to default tenant for backward compatibility (development only)
    if (!tenant && process.env.NODE_ENV !== 'production') {
      const defaultTenantResult = await query(
        'SELECT * FROM Tenants WHERE subdomain = $1',
        ['default']
      );
      tenant = defaultTenantResult.rows[0];
    }

    // If no tenant found and we're in production, reject the request
    if (!tenant && process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found or inactive',
          statusCode: 404
        }
      });
    }

    // Set tenant context
    req.tenant = tenant;

    // If user is authenticated, check tenant access
    if (req.user && tenant) {
      const tenantAccess = await checkTenantAccess(req.user.userId, tenant.tenant_id);
      
      if (!tenantAccess && process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_ACCESS_DENIED',
            message: 'You do not have access to this tenant',
            statusCode: 403
          }
        });
      }

      req.userTenantRole = tenantAccess;
    }

    // Add tenant-aware query helper to request
    req.tenantQuery = (sql, params = []) => {
      if (!tenant) {
        throw new TenantContextError('No tenant context available', 'NO_TENANT_CONTEXT');
      }
      
      // Add tenant_id as the first parameter
      return query(sql, [tenant.tenant_id, ...params]);
    };

    // Add audit logging helper
    req.auditLog = async (action, resourceType, resourceId, metadata = {}) => {
      if (!tenant) return;

      try {
        await query(`
          INSERT INTO TenantAuditLogs (
            tenant_id, user_id, action, resource_type, resource_id,
            ip_address, user_agent, endpoint, http_method, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          tenant.tenant_id,
          req.user?.userId || null,
          action,
          resourceType,
          resourceId,
          req.ip,
          req.get('User-Agent'),
          req.originalUrl,
          req.method,
          JSON.stringify(metadata)
        ]);
      } catch (error) {
        console.error('Failed to log audit entry:', error);
        // Don't fail the request if audit logging fails
      }
    };

    next();

  } catch (error) {
    console.error('Tenant context middleware error:', error);
    
    if (error instanceof TenantContextError) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          statusCode: 400
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to establish tenant context',
        statusCode: 500
      }
    });
  }
};

/**
 * Middleware to require tenant context
 * Use this for routes that must have a tenant
 */
const requireTenant = (req, res, next) => {
  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'TENANT_REQUIRED',
        message: 'This operation requires a tenant context',
        statusCode: 400
      }
    });
  }
  next();
};

/**
 * Middleware to require specific tenant role
 */
const requireTenantRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.userTenantRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_REQUIRED',
          message: 'Tenant access required',
          statusCode: 403
        }
      });
    }

    const userRole = req.userTenantRole.tenant_role;
    const isRoleAllowed = Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userRole)
      : userRole === requiredRoles;

    // Platform admins have access to everything
    if (req.userTenantRole.is_platform_admin || isRoleAllowed) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_TENANT_PERMISSIONS',
          message: `Required role: ${requiredRoles}, but user has: ${userRole}`,
          statusCode: 403
        }
      });
    }
  };
};

/**
 * Feature flag checker middleware
 */
const checkFeatureFlag = (featureKey) => {
  return async (req, res, next) => {
    if (!req.tenant) {
      return next(); // Skip if no tenant context
    }

    try {
      const flagResult = await query(`
        SELECT is_enabled, config 
        FROM TenantFeatureFlags 
        WHERE tenant_id = $1 AND feature_key = $2
      `, [req.tenant.tenant_id, featureKey]);

      const flag = flagResult.rows[0];
      
      if (flag && !flag.is_enabled) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_DISABLED',
            message: `Feature '${featureKey}' is not enabled for this tenant`,
            statusCode: 403
          }
        });
      }

      // Add feature config to request
      req.featureConfig = flag?.config || {};
      next();

    } catch (error) {
      console.error('Feature flag check error:', error);
      next(); // Continue on error (fail open)
    }
  };
};

/**
 * Subscription limits checker
 */
const checkSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    if (!req.tenant) {
      return next();
    }

    try {
      // Get current subscription plan
      const subscriptionResult = await query(`
        SELECT sp.* 
        FROM TenantSubscriptions ts
        JOIN SubscriptionPlans sp ON sp.plan_id = ts.plan_id
        WHERE ts.tenant_id = $1 AND ts.status = 'active'
        ORDER BY ts.created_at DESC
        LIMIT 1
      `, [req.tenant.tenant_id]);

      const plan = subscriptionResult.rows[0];
      
      if (!plan) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NO_ACTIVE_SUBSCRIPTION',
            message: 'No active subscription found',
            statusCode: 403
          }
        });
      }

      // Check specific limits based on limitType
      let currentCount = 0;
      let limit = -1; // -1 means unlimited

      switch (limitType) {
        case 'restaurants':
          const restaurantCount = await query(
            'SELECT COUNT(*) FROM Restaurants WHERE tenant_id = $1',
            [req.tenant.tenant_id]
          );
          currentCount = parseInt(restaurantCount.rows[0].count);
          limit = plan.max_restaurants;
          break;

        case 'orders':
          const orderCount = await query(`
            SELECT COUNT(*) FROM Orders 
            WHERE tenant_id = $1 
            AND created_at >= date_trunc('month', CURRENT_DATE)
          `, [req.tenant.tenant_id]);
          currentCount = parseInt(orderCount.rows[0].count);
          limit = plan.max_orders_per_month;
          break;

        case 'riders':
          const riderCount = await query(
            'SELECT COUNT(*) FROM Riders WHERE tenant_id = $1',
            [req.tenant.tenant_id]
          );
          currentCount = parseInt(riderCount.rows[0].count);
          limit = plan.max_riders;
          break;
      }

      // Check if limit is exceeded (unlimited plans have limit = -1)
      if (limit !== -1 && currentCount >= limit) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_LIMIT_EXCEEDED',
            message: `${limitType} limit exceeded. Current: ${currentCount}, Limit: ${limit}`,
            statusCode: 403,
            details: {
              current: currentCount,
              limit: limit,
              plan: plan.display_name
            }
          }
        });
      }

      next();

    } catch (error) {
      console.error('Subscription limit check error:', error);
      next(); // Continue on error (fail open)
    }
  };
};

module.exports = {
  tenantContext,
  requireTenant,
  requireTenantRole,
  checkFeatureFlag,
  checkSubscriptionLimits,
  TenantContextError
};