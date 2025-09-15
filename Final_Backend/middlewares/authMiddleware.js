// Enhanced Multi-Tenant Authentication Middleware
// ===============================================
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
require('dotenv').config();

/**
 * Enhanced authentication middleware with multi-tenant support
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    console.log("❌ No authorization header found for:", req.method, req.url);
    return res.status(401).json({ 
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Access denied, no token provided',
        statusCode: 401
      }
    });
  }
  
  // Extract token from "Bearer TOKEN" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  if (!token) {
    console.log("❌ Invalid token format for:", req.method, req.url);
    return res.status(401).json({ 
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Access denied, invalid token format',
        statusCode: 401
      }
    });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_key_for_food_delivery_app_2024');
    
    // Get fresh user data from database
    const userResult = await query(
      'SELECT * FROM Users WHERE user_id = $1 AND status = $2',
      [decoded.userId, 'active']
    );
    
    const user = userResult.rows[0];
    if (!user) {
      console.log("❌ User not found or inactive:", decoded.userId);
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or account is inactive',
          statusCode: 401
        }
      });
    }
    
    // Update last login
    await query(
      'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );
    
    // Attach user data to request (without password)
    const { password, password_reset_token, email_verification_token, ...safeUser } = user;
    req.user = {
      ...decoded,
      ...safeUser,
      userId: user.user_id // Ensure consistency
    };
    
    next();
    
  } catch (error) {
    console.error('❌ Token verification error for:', req.method, req.url, error.message);
    
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Invalid token';
    
    if (error.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorCode = 'INVALID_TOKEN';
      errorMessage = 'Invalid token';
    }
    
    res.status(401).json({ 
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        statusCode: 401
      }
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return next(); // Continue without authentication
  }
  
  // Use regular auth middleware if token is present
  return authMiddleware(req, res, next);
};

/**
 * Platform admin only middleware
 */
const platformAdminOnly = (req, res, next) => {
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

module.exports = {
  authMiddleware,
  optionalAuth,
  platformAdminOnly
};

// Backward compatibility - default export is authMiddleware
module.exports.default = authMiddleware;
