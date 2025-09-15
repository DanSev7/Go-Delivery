// Enhanced Multi-Tenant User Controller
// =====================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const userQueries = require('../queries/userQueries');
const crypto = require('crypto');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'customer', 
      phone_number, 
      address, 
      profile_picture,
      tenant_id // Optional: for registering directly into a tenant
    } = req.body;
    
    console.log("Registering user:", { name, email, role });
    
    // Validate email uniqueness
    const existingUser = await query(
      'SELECT user_id FROM Users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email is already registered',
          statusCode: 409
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await userQueries.createUser(
      name,
      email,
      hashedPassword,
      role,
      phone_number,
      address,
      profile_picture
    );
    
    // If tenant_id is provided, add user to tenant
    if (tenant_id && req.user?.is_platform_admin) {
      await query(`
        INSERT INTO UserTenants (user_id, tenant_id, tenant_role, status)
        VALUES ($1, $2, $3, $4)
      `, [newUser.user_id, tenant_id, 'viewer', 'active']);
    }
    
    // Don't return password
    const { password: _, ...safeUser } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: safeUser,
      code: 'USER_REGISTERED'
    });
    
  } catch (error) {
    console.error("Error when creating the user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_REGISTRATION_FAILED',
        message: 'Error registering user',
        statusCode: 500
      }
    });
  }
};

// Enhanced login with tenant support
const loginUser = async (req, res) => {
  try {
    const { email, password, tenant_subdomain } = req.body;
    console.log("Login attempt:", { email, tenant_subdomain });
    
    // Get user by email
    const user = await userQueries.getUserByEmail(email);
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        }
      });
    }
    
    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is not active',
          statusCode: 403
        }
      });
    }
    
    console.log("User found:", { id: user.user_id, email: user.email, role: user.role });
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("Password validation:", validPassword);
    
    if (!validPassword) {
      console.log("Password validation failed for user:", user.email);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          statusCode: 401
        }
      });
    }
    
    // Get tenant information if subdomain provided
    let tenantAccess = [];
    let selectedTenant = null;
    
    if (tenant_subdomain) {
      // Get specific tenant
      const tenantResult = await query(
        'SELECT * FROM Tenants WHERE subdomain = $1 AND status = $2',
        [tenant_subdomain, 'active']
      );
      
      if (tenantResult.rows.length > 0) {
        selectedTenant = tenantResult.rows[0];
        
        // Check if user has access to this tenant
        const accessResult = await query(`
          SELECT ut.*, t.name as tenant_name, t.subdomain
          FROM UserTenants ut
          JOIN Tenants t ON t.tenant_id = ut.tenant_id
          WHERE ut.user_id = $1 AND ut.tenant_id = $2 AND ut.status = 'active'
        `, [user.user_id, selectedTenant.tenant_id]);
        
        tenantAccess = accessResult.rows;
      }
    } else {
      // Get all tenants user has access to
      const accessResult = await query(`
        SELECT ut.*, t.name as tenant_name, t.subdomain
        FROM UserTenants ut
        JOIN Tenants t ON t.tenant_id = ut.tenant_id
        WHERE ut.user_id = $1 AND ut.status = 'active'
        ORDER BY ut.joined_at DESC
      `, [user.user_id]);
      
      tenantAccess = accessResult.rows;
    }
    
    // Generate JWT with enhanced claims
    const tokenPayload = {
      userId: user.user_id,
      role: user.role,
      email: user.email,
      is_platform_admin: user.is_platform_admin || false
    };
    
    // Add tenant info to token if single tenant access
    if (selectedTenant && tenantAccess.length > 0) {
      tokenPayload.tenant_id = selectedTenant.tenant_id;
      tokenPayload.tenant_role = tenantAccess[0].tenant_role;
    }
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'jwt_secret_key_for_food_delivery_app_2024',
      { expiresIn: '24h' }
    );
    
    // Update last login
    await query(
      'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );
    
    console.log("Successfully authenticated user:", user.email);
    
    // Don't send password in response
    const { password: _, password_reset_token, email_verification_token, ...safeUser } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: safeUser,
        tenant_access: tenantAccess,
        selected_tenant: selectedTenant
      },
      code: 'LOGIN_SUCCESSFUL'
    });
    
  } catch (error) {
    console.error("Error when authenticating user:", error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Error logging in',
        statusCode: 500
      }
    });
  }
};

// Get user profile with tenant information
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching profile for user:", userId);
    
    const user = await userQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        }
      });
    }
    
    // Get tenant access information
    const tenantAccessResult = await query(`
      SELECT 
        ut.*,
        t.name as tenant_name,
        t.subdomain,
        t.logo_url,
        t.primary_color
      FROM UserTenants ut
      JOIN Tenants t ON t.tenant_id = ut.tenant_id
      WHERE ut.user_id = $1 AND ut.status = 'active'
      ORDER BY ut.joined_at DESC
    `, [userId]);
    
    // Don't send sensitive data
    const { password, password_reset_token, email_verification_token, ...safeUser } = user;
    
    res.json({
      success: true,
      data: {
        user: safeUser,
        tenant_access: tenantAccessResult.rows
      }
    });
    
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: 'Error fetching profile',
        statusCode: 500
      }
    });
  }
};

// Get all users (enhanced for multi-tenant)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, tenant_id } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query based on user permissions
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    // Platform admins can see all users
    if (!req.user.is_platform_admin) {
      // Non-platform admins can only see users in their tenants
      if (req.tenant) {
        whereClause += ` AND u.user_id IN (
          SELECT ut.user_id FROM UserTenants ut 
          WHERE ut.tenant_id = $${paramCount}
        )`;
        params.push(req.tenant.tenant_id);
        paramCount++;
      } else {
        // If no tenant context, only show the user themselves
        whereClause += ` AND u.user_id = $${paramCount}`;
        params.push(req.user.userId);
        paramCount++;
      }
    }
    
    // Add filters
    if (role) {
      whereClause += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }
    
    if (status) {
      whereClause += ` AND u.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (tenant_id && req.user.is_platform_admin) {
      whereClause += ` AND u.user_id IN (
        SELECT ut.user_id FROM UserTenants ut 
        WHERE ut.tenant_id = $${paramCount}
      )`;
      params.push(tenant_id);
      paramCount++;
    }
    
    const usersResult = await query(`
      SELECT 
        u.user_id, u.name, u.email, u.role, u.phone_number, 
        u.status, u.last_login, u.created_at,
        COUNT(ut.tenant_id) as tenant_count
      FROM Users u
      LEFT JOIN UserTenants ut ON u.user_id = ut.user_id AND ut.status = 'active'
      ${whereClause}
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...params, limit, offset]);
    
    const countResult = await query(`
      SELECT COUNT(DISTINCT u.user_id) as total
      FROM Users u
      LEFT JOIN UserTenants ut ON u.user_id = ut.user_id AND ut.status = 'active'
      ${whereClause}
    `, params);
    
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
          items_per_page: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USERS_FETCH_FAILED',
        message: 'Error fetching users',
        statusCode: 500
      }
    });
  }
};

// Enhanced delete user with tenant awareness
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Attempting to delete user:", userId);
    
    // Check if user exists
    const userResult = await query(
      'SELECT * FROM Users WHERE user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        }
      });
    }
    
    const userToDelete = userResult.rows[0];
    
    // Platform admins can delete anyone
    if (!req.user.is_platform_admin) {
      // Non-platform admins can only delete users in their tenant
      if (!req.tenant) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Cannot delete users outside tenant context',
            statusCode: 403
          }
        });
      }
      
      // Check if user belongs to the same tenant
      const tenantUserResult = await query(
        'SELECT * FROM UserTenants WHERE user_id = $1 AND tenant_id = $2',
        [userId, req.tenant.tenant_id]
      );
      
      if (tenantUserResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'USER_NOT_IN_TENANT',
            message: 'User is not a member of your tenant',
            statusCode: 403
          }
        });
      }
    }
    
    // Prevent deleting platform admins (unless done by another platform admin)
    if (userToDelete.is_platform_admin && !req.user.is_platform_admin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_PLATFORM_ADMIN',
          message: 'Cannot delete platform administrator',
          statusCode: 403
        }
      });
    }
    
    // Prevent self-deletion
    if (parseInt(userId) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Cannot delete your own account',
          statusCode: 400
        }
      });
    }
    
    await userQueries.deleteUser(userId);
    
    // Log the deletion
    if (req.auditLog) {
      await req.auditLog('user_deleted', 'user', userId, {
        deleted_user_email: userToDelete.email,
        deleted_by: req.user.email
      });
    }
    
    console.log("User deleted:", userId);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      code: 'USER_DELETED'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_DELETION_FAILED',
        message: 'Error deleting user',
        statusCode: 500
      }
    });
  }
};

// Enhanced update user with tenant awareness
const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, password, role, phone_number, address, profile_picture, status } = req.body;
    
    // Check if user exists
    const existingUser = await userQueries.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        }
      });
    }
    
    // Check permissions
    const isUpdatingSelf = parseInt(userId) === req.user.userId;
    const isPlatformAdmin = req.user.is_platform_admin;
    
    if (!isPlatformAdmin && !isUpdatingSelf) {
      // Check if user is in the same tenant (for tenant admins)
      if (req.userTenantRole?.tenant_role !== 'tenant_admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions to update this user',
            statusCode: 403
          }
        });
      }
    }
    
    // Restrict what can be updated based on permissions
    let updateData = { name, phone_number, address, profile_picture };
    
    if (isPlatformAdmin) {
      // Platform admins can update everything
      updateData = { name, email, role, phone_number, address, profile_picture, status };
    } else if (req.userTenantRole?.tenant_role === 'tenant_admin' && !isUpdatingSelf) {
      // Tenant admins can update most things for their tenant users
      updateData = { name, phone_number, address, profile_picture };
    }
    
    // Hash password if provided
    let hashedPassword = undefined;
    if (password && (isPlatformAdmin || isUpdatingSelf)) {
      hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    
    // Update user in DB
    const updatedUser = await userQueries.updateUser(
      userId,
      updateData.name || existingUser.name,
      updateData.email || existingUser.email,
      updateData.password || existingUser.password,
      updateData.role || existingUser.role,
      updateData.phone_number || existingUser.phone_number,
      updateData.address || existingUser.address,
      updateData.profile_picture || existingUser.profile_picture
    );
    
    // Update status if provided and user has permission
    if (status && (isPlatformAdmin || req.userTenantRole?.tenant_role === 'tenant_admin')) {
      await query(
        'UPDATE Users SET status = $1 WHERE user_id = $2',
        [status, userId]
      );
    }
    
    // Log the update
    if (req.auditLog) {
      await req.auditLog('user_updated', 'user', userId, {
        updated_fields: Object.keys(updateData),
        updated_by: req.user.email,
        is_self_update: isUpdatingSelf
      });
    }
    
    // Don't return password
    const { password: _, ...safeUser } = updatedUser;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: safeUser,
      code: 'USER_UPDATED'
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_UPDATE_FAILED',
        message: 'Error updating user',
        statusCode: 500
      }
    });
  }
};

// Password reset functionality
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await userQueries.getUserByEmail(email);
    if (!user) {
      // Return success even if user not found (security best practice)
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        code: 'PASSWORD_RESET_REQUESTED'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token
    await query(
      'UPDATE Users SET password_reset_token = $1, password_reset_expires = $2 WHERE user_id = $3',
      [resetToken, resetExpires, user.user_id]
    );
    
    // TODO: Send email with reset link
    console.log('Password reset token generated for:', email, resetToken);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      code: 'PASSWORD_RESET_REQUESTED'
    });
    
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_REQUEST_FAILED',
        message: 'Error requesting password reset',
        statusCode: 500
      }
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    const userResult = await query(
      'SELECT * FROM Users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired reset token',
          statusCode: 400
        }
      });
    }
    
    const user = userResult.rows[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password and clear reset token
    await query(`
      UPDATE Users 
      SET password = $1, password_reset_token = NULL, password_reset_expires = NULL 
      WHERE user_id = $2
    `, [hashedPassword, user.user_id]);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      code: 'PASSWORD_RESET_COMPLETED'
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_FAILED',
        message: 'Error resetting password',
        statusCode: 500
      }
    });
  }
};


const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.userId; // User ID to update
    console.log("User Id when we try to update the password : ", userId);
    const { previousPassword, newPassword } = req.body; // Get previous and new passwords
    console.log("User Id on udpated password : ", userId);

    // Retrieve the current user from the database
    const user = await userQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the previous password with the stored password
    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Previous password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await userQueries.updatePassword(userId, hashedPassword);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log("Error when updating the user's password: ", error.message);
    res.status(500).json({ message: 'Error updating password', error });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers, 
  deleteUser, 
  updateUser,
  updateUserPassword,
  requestPasswordReset,
  resetPassword
};
