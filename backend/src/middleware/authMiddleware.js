/**
 * Authentication Middleware
 * Prepared for JWT Bearer Token validation and user context extraction.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // In Phase 3, we extract any dummy/test user payload or fallback cleanly
      // When JWT_SECRET is fully utilized in auth phase, jwt.verify will be applied
      req.user = { id: req.headers['x-user-id'] || null, token };
    } else if (req.headers['x-user-id']) {
      req.user = { id: req.headers['x-user-id'] };
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require Authentication guard
 */
export const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid token or user context.'
    });
  }
  next();
};

export default {
  authenticate,
  requireAuth
};
