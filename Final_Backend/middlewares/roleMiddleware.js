// Enhanced Multi-Tenant Role-Based Access Control Middleware
// ===========================================================

/**
 * Enhanced role middleware for multi-tenant SaaS platform
 * Supports both global roles and tenant-specific roles
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
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

      const userRole = req.user.role;
      
      if (!userRole) {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'NO_ROLE_FOUND',
            message: 'User role not found',
            statusCode: 403
          }
        });
      }

      // Platform admins have access to everything
      if (req.user.is_platform_admin || userRole === 'platform_admin') {
        return next();
      }

      // Check if user's global role is in the allowed roles array
      const isRoleAllowed = Array.isArray(allowedRoles) 
        ? allowedRoles.includes(userRole)
        : userRole === allowedRoles;

      if (isRoleAllowed) {
        next();
      } else {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Access denied. Required role: ${allowedRoles}, but user has: ${userRole}`,
            statusCode: 403
          }
        });
      }
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        error: {
          code: 'ROLE_CHECK_ERROR',
          message: 'Internal server error during role check',
          statusCode: 500
        }
      });
    }
  };
};

/**
 * Check tenant-specific roles (works with tenant context)
 * This should be used after tenantContext middleware
 */
const checkTenantRole = (allowedTenantRoles) => {
  return (req, res, next) => {
    try {
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

      // Platform admins bypass tenant role checks
      if (req.user.is_platform_admin || req.user.role === 'platform_admin') {
        return next();
      }

      // Check if user has tenant access
      if (!req.userTenantRole) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NO_TENANT_ACCESS',
            message: 'User does not have access to this tenant',
            statusCode: 403
          }
        });
      }

      const userTenantRole = req.userTenantRole.tenant_role;
      const isRoleAllowed = Array.isArray(allowedTenantRoles) 
        ? allowedTenantRoles.includes(userTenantRole)
        : userTenantRole === allowedTenantRoles;

      if (isRoleAllowed) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_TENANT_PERMISSIONS',
            message: `Access denied. Required tenant role: ${allowedTenantRoles}, but user has: ${userTenantRole}`,
            statusCode: 403
          }
        });
      }
    } catch (error) {
      console.error('Tenant role check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'TENANT_ROLE_CHECK_ERROR',
          message: 'Internal server error during tenant role check',
          statusCode: 500
        }
      });
    }
  };
};

// =============================================================================
// GLOBAL ROLE CONVENIENCE FUNCTIONS
// =============================================================================

// Platform admin only (global)
const platformAdminOnly = () => {
  return (req, res, next) => {
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
    
    if (!req.user.is_platform_admin && req.user.role !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PLATFORM_ADMIN_REQUIRED',
          message: 'Platform administrator access required',
          statusCode: 403
        }
      });
    }
    
    next();
  };
};

// Global admin (includes platform admin)
const adminOnly = () => checkRole(['admin', 'platform_admin']);

// Restaurant manager (global role)
const restaurantManagerOnly = () => checkRole(['restaurant_manager']);

// Rider (global role)
const riderOnly = () => checkRole(['rider']);

// Customer (global role)
const customerOnly = () => checkRole(['customer']);

// Admin or restaurant manager
const adminOrRestaurantManager = () => checkRole(['admin', 'restaurant_manager', 'platform_admin']);

// Restaurant manager or rider
const restaurantManagerOrRider = () => checkRole(['restaurant_manager', 'rider']);

// =============================================================================
// TENANT ROLE CONVENIENCE FUNCTIONS
// =============================================================================

// Tenant admin only
const tenantAdminOnly = () => checkTenantRole(['tenant_admin']);

// Tenant manager (includes tenant admin)
const tenantManagerOnly = () => checkTenantRole(['tenant_admin', 'manager']);

// Tenant staff (includes all management roles)
const tenantStaffOnly = () => checkTenantRole(['tenant_admin', 'manager', 'staff']);

// Any tenant access (includes viewers)
const tenantAccessOnly = () => checkTenantRole(['tenant_admin', 'manager', 'staff', 'viewer']);

// =============================================================================
// HYBRID ROLE FUNCTIONS (Global + Tenant)
// =============================================================================

/**
 * Check both global and tenant roles
 * User must have either the global role OR the tenant role
 */
const checkGlobalOrTenantRole = (globalRoles, tenantRoles) => {
  return (req, res, next) => {
    try {
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

      // Platform admins bypass all checks
      if (req.user.is_platform_admin || req.user.role === 'platform_admin') {
        return next();
      }

      // Check global role
      const hasGlobalRole = Array.isArray(globalRoles) 
        ? globalRoles.includes(req.user.role)
        : req.user.role === globalRoles;

      if (hasGlobalRole) {
        return next();
      }

      // Check tenant role if user has tenant access
      if (req.userTenantRole) {
        const hasTenantRole = Array.isArray(tenantRoles) 
          ? tenantRoles.includes(req.userTenantRole.tenant_role)
          : req.userTenantRole.tenant_role === tenantRoles;

        if (hasTenantRole) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required global role: ${globalRoles} OR tenant role: ${tenantRoles}`,
          statusCode: 403
        }
      });

    } catch (error) {
      console.error('Hybrid role check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'ROLE_CHECK_ERROR',
          message: 'Internal server error during role check',
          statusCode: 500
        }
      });
    }
  };
};

// =============================================================================
// PERMISSION-BASED ACCESS CONTROL
// =============================================================================

/**
 * Check specific permissions (works with tenant context)
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
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

      // Platform admins have all permissions
      if (req.user.is_platform_admin || req.user.role === 'platform_admin') {
        return next();
      }

      // Check tenant-specific permissions
      if (req.userTenantRole && req.userTenantRole.permissions) {
        const permissions = req.userTenantRole.permissions;
        
        if (permissions[requiredPermission] === true) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required permission: ${requiredPermission}`,
          statusCode: 403
        }
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_ERROR',
          message: 'Internal server error during permission check',
          statusCode: 500
        }
      });
    }
  };
};

module.exports = {
  // Core functions
  checkRole,
  checkTenantRole,
  checkGlobalOrTenantRole,
  checkPermission,
  
  // Global role convenience functions
  platformAdminOnly,
  adminOnly,
  restaurantManagerOnly,
  riderOnly,
  customerOnly,
  adminOrRestaurantManager,
  restaurantManagerOrRider,
  
  // Tenant role convenience functions
  tenantAdminOnly,
  tenantManagerOnly,
  tenantStaffOnly,
  tenantAccessOnly
};