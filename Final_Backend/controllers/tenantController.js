// Tenant Management Controller
// ============================
// Handles tenant onboarding, management, and configuration

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new tenant (Tenant Onboarding)
 */
const createTenant = async (req, res) => {
  try {
    const {
      name,
      subdomain,
      contact_email,
      contact_phone,
      business_address,
      subscription_plan = 'trial',
      custom_domain,
      
      // Admin user details
      admin_name,
      admin_email,
      admin_password,
      admin_phone
    } = req.body;

    // Validate required fields
    if (!name || !subdomain || !contact_email || !admin_name || !admin_email || !admin_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing required fields for tenant creation',
          statusCode: 400
        }
      });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]{3,}$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUBDOMAIN',
          message: 'Subdomain must be at least 3 characters and contain only lowercase letters, numbers, and hyphens',
          statusCode: 400
        }
      });
    }

    // Check if subdomain is already taken
    const existingSubdomain = await query(
      'SELECT tenant_id FROM Tenants WHERE subdomain = $1',
      [subdomain]
    );

    if (existingSubdomain.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SUBDOMAIN_EXISTS',
          message: 'Subdomain is already taken',
          statusCode: 409
        }
      });
    }

    // Check if admin email already exists
    const existingUser = await query(
      'SELECT user_id FROM Users WHERE email = $1',
      [admin_email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Admin email is already registered',
          statusCode: 409
        }
      });
    }

    // Get subscription plan details
    const planResult = await query(
      'SELECT * FROM SubscriptionPlans WHERE name = $1 AND status = $2',
      [subscription_plan, 'active']
    );

    const plan = planResult.rows[0];
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUBSCRIPTION_PLAN',
          message: 'Invalid subscription plan',
          statusCode: 400
        }
      });
    }

    // Start transaction
    const client = await query.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create tenant
      const tenantId = uuidv4();
      const tenantResult = await client.query(`
        INSERT INTO Tenants (
          tenant_id, name, subdomain, custom_domain, status,
          contact_email, contact_phone, business_address,
          subscription_plan, subscription_status,
          max_restaurants, max_orders_per_month, max_riders,
          features, trial_ends_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *
      `, [
        tenantId,
        name,
        subdomain,
        custom_domain,
        subscription_plan === 'trial' ? 'trial' : 'active',
        contact_email,
        contact_phone,
        business_address,
        subscription_plan,
        subscription_plan === 'trial' ? 'trialing' : 'active',
        plan.max_restaurants,
        plan.max_orders_per_month,
        plan.max_riders,
        JSON.stringify(plan.features),
        subscription_plan === 'trial' 
          ? new Date(Date.now() + plan.trial_duration_days * 24 * 60 * 60 * 1000)
          : null
      ]);

      const tenant = tenantResult.rows[0];

      // Create admin user
      const hashedPassword = await bcrypt.hash(admin_password, 10);
      const userResult = await client.query(`
        INSERT INTO Users (
          name, email, password, role, phone_number, address,
          email_verified, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, [
        admin_name,
        admin_email,
        hashedPassword,
        'restaurant_manager',
        admin_phone,
        business_address,
        true, // Auto-verify for tenant admins
        'active'
      ]);

      const adminUser = userResult.rows[0];

      // Link user to tenant as tenant admin
      await client.query(`
        INSERT INTO UserTenants (
          user_id, tenant_id, tenant_role, status
        ) VALUES ($1, $2, $3, $4)
      `, [
        adminUser.user_id,
        tenantId,
        'tenant_admin',
        'active'
      ]);

      // Create initial subscription record
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      await client.query(`
        INSERT INTO TenantSubscriptions (
          tenant_id, plan_id, status, current_period_start, current_period_end,
          amount, currency, billing_cycle, trial_start, trial_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        tenantId,
        plan.plan_id,
        subscription_plan === 'trial' ? 'trialing' : 'active',
        currentPeriodStart,
        currentPeriodEnd,
        plan.price_monthly,
        plan.currency,
        'monthly',
        subscription_plan === 'trial' ? currentPeriodStart : null,
        subscription_plan === 'trial' ? tenant.trial_ends_at : null
      ]);

      // Initialize feature flags for tenant
      const defaultFeatures = [
        { key: 'real_time_tracking', enabled: plan.features.real_time_tracking || false },
        { key: 'analytics', enabled: plan.features.analytics || false },
        { key: 'api_access', enabled: plan.features.api_access || false },
        { key: 'custom_branding', enabled: plan.features.custom_branding || false },
        { key: 'priority_support', enabled: plan.features.priority_support || false }
      ];

      for (const feature of defaultFeatures) {
        await client.query(`
          INSERT INTO TenantFeatureFlags (tenant_id, feature_key, is_enabled)
          VALUES ($1, $2, $3)
        `, [tenantId, feature.key, feature.enabled]);
      }

      // Log tenant creation
      await client.query(`
        INSERT INTO TenantAuditLogs (
          tenant_id, user_id, action, resource_type, resource_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        tenantId,
        adminUser.user_id,
        'tenant_created',
        'tenant',
        tenantId,
        JSON.stringify({
          subdomain,
          subscription_plan,
          created_by: adminUser.email
        })
      ]);

      await client.query('COMMIT');

      // Generate JWT token for admin user
      const token = jwt.sign(
        { 
          userId: adminUser.user_id, 
          role: adminUser.role,
          tenantId: tenantId
        },
        process.env.JWT_SECRET || 'jwt_secret_key_for_food_delivery_app_2024',
        { expiresIn: '24h' }
      );

      // Don't send password in response
      const { password, ...safeAdminUser } = adminUser;

      res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: {
          tenant: {
            ...tenant,
            url: `https://${subdomain}.fooddelivery.com`,
            dashboard_url: `https://${subdomain}.fooddelivery.com/dashboard`
          },
          admin: safeAdminUser,
          token,
          subscription_plan: plan
        },
        code: 'TENANT_CREATED'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_CREATION_FAILED',
        message: 'Failed to create tenant',
        statusCode: 500
      }
    });
  }
};

/**
 * Get tenant details
 */
const getTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenantResult = await query(`
      SELECT 
        t.*,
        ts.status as subscription_status,
        sp.display_name as plan_display_name,
        sp.features as plan_features,
        COUNT(DISTINCT r.restaurant_id) as restaurant_count,
        COUNT(DISTINCT u.user_id) as user_count
      FROM Tenants t
      LEFT JOIN TenantSubscriptions ts ON t.tenant_id = ts.tenant_id AND ts.status = 'active'
      LEFT JOIN SubscriptionPlans sp ON ts.plan_id = sp.plan_id
      LEFT JOIN Restaurants r ON t.tenant_id = r.tenant_id
      LEFT JOIN UserTenants ut ON t.tenant_id = ut.tenant_id AND ut.status = 'active'
      LEFT JOIN Users u ON ut.user_id = u.user_id
      WHERE t.tenant_id = $1
      GROUP BY t.tenant_id, ts.subscription_id, sp.plan_id
    `, [tenantId]);

    const tenant = tenantResult.rows[0];
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
          statusCode: 404
        }
      });
    }

    // Get feature flags
    const featuresResult = await query(`
      SELECT feature_key, is_enabled, config 
      FROM TenantFeatureFlags 
      WHERE tenant_id = $1
    `, [tenantId]);

    const features = {};
    featuresResult.rows.forEach(feature => {
      features[feature.feature_key] = {
        enabled: feature.is_enabled,
        config: feature.config
      };
    });

    res.json({
      success: true,
      data: {
        ...tenant,
        features,
        url: `https://${tenant.subdomain}.fooddelivery.com`
      }
    });

  } catch (error) {
    console.error('Error getting tenant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_FETCH_FAILED',
        message: 'Failed to fetch tenant details',
        statusCode: 500
      }
    });
  }
};

/**
 * Update tenant details
 */
const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;

    // Validate tenant exists and user has access
    if (req.tenant.tenant_id !== tenantId && !req.user.is_platform_admin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_DENIED',
          message: 'Access denied to this tenant',
          statusCode: 403
        }
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'name', 'contact_email', 'contact_phone', 'business_address',
      'logo_url', 'primary_color', 'secondary_color', 'theme_config'
    ];

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(updates[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES_PROVIDED',
          message: 'No valid updates provided',
          statusCode: 400
        }
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(tenantId);

    const updateQuery = `
      UPDATE Tenants 
      SET ${updateFields.join(', ')}
      WHERE tenant_id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    // Log the update
    if (req.auditLog) {
      await req.auditLog('tenant_updated', 'tenant', tenantId, { updated_fields: Object.keys(updates) });
    }

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0],
      code: 'TENANT_UPDATED'
    });

  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_UPDATE_FAILED',
        message: 'Failed to update tenant',
        statusCode: 500
      }
    });
  }
};

/**
 * List all tenants (Platform admin only)
 */
const listTenants = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, subscription_plan } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      whereClause += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (subscription_plan) {
      whereClause += ` AND t.subscription_plan = $${paramCount}`;
      params.push(subscription_plan);
      paramCount++;
    }

    const tenantsResult = await query(`
      SELECT 
        t.*,
        ts.status as subscription_status,
        sp.display_name as plan_display_name,
        COUNT(DISTINCT r.restaurant_id) as restaurant_count,
        COUNT(DISTINCT ut.user_id) as user_count
      FROM Tenants t
      LEFT JOIN TenantSubscriptions ts ON t.tenant_id = ts.tenant_id AND ts.status = 'active'
      LEFT JOIN SubscriptionPlans sp ON ts.plan_id = sp.plan_id
      LEFT JOIN Restaurants r ON t.tenant_id = r.tenant_id
      LEFT JOIN UserTenants ut ON t.tenant_id = ut.tenant_id AND ut.status = 'active'
      ${whereClause}
      GROUP BY t.tenant_id, ts.subscription_id, sp.plan_id
      ORDER BY t.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...params, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(DISTINCT t.tenant_id) as total
      FROM Tenants t
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        tenants: tenantsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TENANTS_FETCH_FAILED',
        message: 'Failed to fetch tenants',
        statusCode: 500
      }
    });
  }
};

/**
 * Suspend/Activate tenant (Platform admin only)
 */
const updateTenantStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'suspended', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid tenant status',
          statusCode: 400
        }
      });
    }

    const result = await query(`
      UPDATE Tenants 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $2
      RETURNING *
    `, [status, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
          statusCode: 404
        }
      });
    }

    // Log status change
    await query(`
      INSERT INTO TenantAuditLogs (
        tenant_id, user_id, action, resource_type, resource_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      tenantId,
      req.user.user_id,
      'tenant_status_changed',
      'tenant',
      tenantId,
      JSON.stringify({ new_status: status, reason: reason || 'No reason provided' })
    ]);

    res.json({
      success: true,
      message: `Tenant ${status} successfully`,
      data: result.rows[0],
      code: 'TENANT_STATUS_UPDATED'
    });

  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TENANT_STATUS_UPDATE_FAILED',
        message: 'Failed to update tenant status',
        statusCode: 500
      }
    });
  }
};

/**
 * Get tenant dashboard statistics
 */
const getTenantDashboard = async (req, res) => {
  try {
    const tenantId = req.tenant.tenant_id;

    // Get various statistics
    const [
      restaurantStats,
      orderStats,
      userStats,
      revenueStats
    ] = await Promise.all([
      query(`
        SELECT COUNT(*) as total
        FROM Restaurants 
        WHERE tenant_id = $1
      `, [tenantId]),
      
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today
        FROM Orders 
        WHERE tenant_id = $1
      `, [tenantId]),
      
      query(`
        SELECT COUNT(DISTINCT ut.user_id) as total
        FROM UserTenants ut
        JOIN Users u ON u.user_id = ut.user_id
        WHERE ut.tenant_id = $1 AND ut.status = 'active'
      `, [tenantId]),
      
      query(`
        SELECT 
          SUM(total_price) as total_revenue,
          SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_price ELSE 0 END) as today_revenue,
          SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total_price ELSE 0 END) as month_revenue
        FROM Orders 
        WHERE tenant_id = $1 AND payment_status = 'paid'
      `, [tenantId])
    ]);

    res.json({
      success: true,
      data: {
        restaurants: {
          total: parseInt(restaurantStats.rows[0].total)
        },
        orders: {
          total: parseInt(orderStats.rows[0].total),
          delivered: parseInt(orderStats.rows[0].delivered),
          today: parseInt(orderStats.rows[0].today)
        },
        users: {
          total: parseInt(userStats.rows[0].total)
        },
        revenue: {
          total: parseFloat(revenueStats.rows[0].total_revenue || 0),
          today: parseFloat(revenueStats.rows[0].today_revenue || 0),
          month: parseFloat(revenueStats.rows[0].month_revenue || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error getting tenant dashboard:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_FETCH_FAILED',
        message: 'Failed to fetch dashboard data',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  createTenant,
  getTenant,
  updateTenant,
  listTenants,
  updateTenantStatus,
  getTenantDashboard
};