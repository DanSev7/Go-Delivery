// Tenant Management Routes
// ========================
const express = require("express");
const tenantController = require("../controllers/tenantController");
const {
  authMiddleware,
  platformAdminOnly,
} = require("../middlewares/authMiddleware");
const {
  tenantContext,
  requireTenant,
  requireTenantRole,
} = require("../middlewares/tenantMiddleware");
const { query } = require("../config/db"); // ✅ require db once at top
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const router = express.Router();

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

// Tenant onboarding - create new tenant with admin user
router.post("/onboard", tenantController.createTenant);

// Check subdomain availability
router.get("/check-subdomain/:subdomain", async (req, res) => {
  try {
    const { subdomain } = req.params;

    const result = await query(
      "SELECT tenant_id FROM Tenants WHERE subdomain = $1",
      [subdomain.toLowerCase()]
    );

    res.json({
      success: true,
      data: {
        available: result.rows.length === 0,
        subdomain,
      },
    });
  } catch (error) {
    console.error("Error checking subdomain:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SUBDOMAIN_CHECK_FAILED",
        message: "Failed to check subdomain availability",
        statusCode: 500,
      },
    });
  }
});

// Get available subscription plans
router.get("/plans", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM SubscriptionPlans WHERE status = $1 ORDER BY price_monthly ASC",
      ["active"]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "PLANS_FETCH_FAILED",
        message: "Failed to fetch subscription plans",
        statusCode: 500,
      },
    });
  }
});

// =============================================================================
// PLATFORM ADMIN ROUTES (Platform admin only)
// =============================================================================

router.use("/admin", authMiddleware, platformAdminOnly);

// List all tenants (with filtering and pagination)
router.get("/admin/tenants", tenantController.listTenants);

// Get specific tenant details (platform admin view)
router.get("/admin/tenants/:tenantId", tenantController.getTenant);

// Update tenant status (suspend/activate)
router.patch(
  "/admin/tenants/:tenantId/status",
  tenantController.updateTenantStatus
);

// Platform admin tenant update (can modify sensitive fields)
router.put("/admin/tenants/:tenantId", tenantController.updateTenant);

// =============================================================================
// TENANT-SCOPED ROUTES (Require authentication and tenant context)
// =============================================================================

router.use(authMiddleware, tenantContext, requireTenant);

// Get current tenant details
router.get(
  "/current",
  requireTenantRole(["tenant_admin", "manager", "staff"]),
  tenantController.getTenant
);

// Update current tenant (tenant admins only)
router.put(
  "/current",
  requireTenantRole(["tenant_admin"]),
  (req, res) => {
    req.params.tenantId = req.tenant.tenant_id;
    return tenantController.updateTenant(req, res);
  }
);

// Get tenant dashboard stats
router.get(
  "/dashboard",
  requireTenantRole(["tenant_admin", "manager"]),
  tenantController.getTenantDashboard
);

// =============================================================================
// TENANT USER MANAGEMENT
// =============================================================================

// Invite user to tenant
router.post(
  "/users/invite",
  requireTenantRole(["tenant_admin", "manager"]),
  async (req, res) => {
    try {
      const { email, tenant_role, permissions = {} } = req.body;
      const tenantId = req.tenant.tenant_id;

      // Validate role
      const validRoles = ["manager", "staff", "viewer"];
      if (!validRoles.includes(tenant_role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "Invalid tenant role",
            statusCode: 400,
          },
        });
      }

      let userId;
      const userResult = await query(
        "SELECT user_id FROM Users WHERE email = $1",
        [email]
      );

      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].user_id;

        const existingTenantUser = await query(
          "SELECT * FROM UserTenants WHERE user_id = $1 AND tenant_id = $2",
          [userId, tenantId]
        );

        if (existingTenantUser.rows.length > 0) {
          return res.status(409).json({
            success: false,
            error: {
              code: "USER_ALREADY_IN_TENANT",
              message: "User is already a member of this tenant",
              statusCode: 409,
            },
          });
        }
      } else {
        // Create new user with pending status
        const tempPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUserResult = await query(
          `INSERT INTO Users (name, email, password, role, status, email_verified) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
          [
            email.split("@")[0], // temporary name
            email,
            hashedPassword,
            "customer",
            "active",
            false,
          ]
        );

        userId = newUserResult.rows[0].user_id;
      }

      // Add user to tenant
      await query(
        `INSERT INTO UserTenants (user_id, tenant_id, tenant_role, permissions, status, invited_by) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, tenantId, tenant_role, JSON.stringify(permissions), "pending", req.user.user_id]
      );

      if (req.auditLog) {
        await req.auditLog("user_invited", "user", userId, {
          email,
          tenant_role,
          invited_by: req.user.email,
        });
      }

      // TODO: Send invitation email

      res.status(201).json({
        success: true,
        message: "User invited successfully",
        data: {
          email,
          tenant_role,
          status: "pending",
        },
        code: "USER_INVITED",
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "USER_INVITATION_FAILED",
          message: "Failed to invite user",
          statusCode: 500,
        },
      });
    }
  }
);

// List tenant users
router.get(
  "/users",
  requireTenantRole(["tenant_admin", "manager"]),
  async (req, res) => {
    try {
      const tenantId = req.tenant.tenant_id;
      const { page = 1, limit = 20, status, role } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = "WHERE ut.tenant_id = $1";
      const params = [tenantId];
      let paramCount = 2;

      if (status) {
        whereClause += ` AND ut.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (role) {
        whereClause += ` AND ut.tenant_role = $${paramCount}`;
        params.push(role);
        paramCount++;
      }

      const usersResult = await query(
        `
        SELECT 
          u.user_id, u.name, u.email, u.role as global_role,
          ut.tenant_role, ut.permissions, ut.status, ut.joined_at,
          invited_by_user.name as invited_by_name
        FROM UserTenants ut
        JOIN Users u ON u.user_id = ut.user_id
        LEFT JOIN Users invited_by_user ON invited_by_user.user_id = ut.invited_by
        ${whereClause}
        ORDER BY ut.joined_at DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `,
        [...params, limit, offset]
      );

      const countResult = await query(
        `
        SELECT COUNT(*) as total
        FROM UserTenants ut
        ${whereClause}
      `,
        params
      );

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users: usersResult.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_items: total,
            items_per_page: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error listing tenant users:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "TENANT_USERS_FETCH_FAILED",
          message: "Failed to fetch tenant users",
          statusCode: 500,
        },
      });
    }
  }
);

// Update tenant user role/permissions
router.put(
  "/users/:userId",
  requireTenantRole(["tenant_admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { tenant_role, permissions } = req.body;
      const tenantId = req.tenant.tenant_id;

      const validRoles = ["tenant_admin", "manager", "staff", "viewer"];
      if (tenant_role && !validRoles.includes(tenant_role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "Invalid tenant role",
            statusCode: 400,
          },
        });
      }

      const result = await query(
        `
        UPDATE UserTenants 
        SET 
          tenant_role = COALESCE($1, tenant_role),
          permissions = COALESCE($2, permissions),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND tenant_id = $4
        RETURNING *
      `,
        [tenant_role, permissions ? JSON.stringify(permissions) : null, userId, tenantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found in this tenant",
            statusCode: 404,
          },
        });
      }

      if (req.auditLog) {
        await req.auditLog("user_role_updated", "user", userId, {
          new_role: tenant_role,
          updated_by: req.user.email,
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
        code: "USER_UPDATED",
      });
    } catch (error) {
      console.error("Error updating tenant user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "USER_UPDATE_FAILED",
          message: "Failed to update user",
          statusCode: 500,
        },
      });
    }
  }
);

// Remove user from tenant
router.delete(
  "/users/:userId",
  requireTenantRole(["tenant_admin"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const tenantId = req.tenant.tenant_id;

      const adminCount = await query(
        `
        SELECT COUNT(*) as count
        FROM UserTenants
        WHERE tenant_id = $1 AND tenant_role = 'tenant_admin' AND status = 'active'
      `,
        [tenantId]
      );

      const userToRemove = await query(
        `
        SELECT tenant_role FROM UserTenants
        WHERE user_id = $1 AND tenant_id = $2
      `,
        [userId, tenantId]
      );

      if (userToRemove.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found in this tenant",
            statusCode: 404,
          },
        });
      }

      if (
        userToRemove.rows[0].tenant_role === "tenant_admin" &&
        parseInt(adminCount.rows[0].count) <= 1
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "CANNOT_REMOVE_LAST_ADMIN",
            message: "Cannot remove the last tenant admin",
            statusCode: 400,
          },
        });
      }

      await query(
        `DELETE FROM UserTenants WHERE user_id = $1 AND tenant_id = $2`,
        [userId, tenantId]
      );

      if (req.auditLog) {
        await req.auditLog("user_removed", "user", userId, {
          removed_by: req.user.email,
        });
      }

      res.json({
        success: true,
        message: "User removed from tenant successfully",
        code: "USER_REMOVED",
      });
    } catch (error) {
      console.error("Error removing tenant user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "USER_REMOVAL_FAILED",
          message: "Failed to remove user",
          statusCode: 500,
        },
      });
    }
  }
);

module.exports = router;
