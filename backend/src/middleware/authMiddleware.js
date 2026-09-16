import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication Middleware
 * Validates JWT Bearer token and attaches decoded user to req.user.
 * Returns 401 Unauthorized if token is missing, invalid, or expired.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Access token is missing or malformed.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token not found.'
      });
    }

    try {
      const decoded = verifyToken(token);
      const userId = decoded.userId || decoded.id || decoded._id;

      req.user = {
        userId,
        id: userId,
        _id: userId,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token is invalid or has expired.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional / Contextual Authenticate Middleware
 * Extracts user if token is present without throwing 401 if missing.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          const userId = decoded.userId || decoded.id || decoded._id;
          req.user = {
            userId,
            id: userId,
            _id: userId,
            email: decoded.email,
            role: decoded.role
          };
        } catch {
          // If invalid in non-strict context, fallback to x-user-id or null
          req.user = req.headers['x-user-id'] ? { id: req.headers['x-user-id'] } : null;
        }
      }
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

export const requireAuth = authMiddleware;

export default {
  authMiddleware,
  authenticate,
  requireAuth
};
