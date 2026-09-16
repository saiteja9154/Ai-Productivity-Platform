/**
 * Role-Based Authorization Middleware
 * Restricts endpoint access to users with authorized roles.
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'user')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // If user is not authenticated, return 401
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication is required before role verification.'
      });
    }

    // Check if user's role is permitted
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

export const requireAdmin = authorizeRoles('admin');

export default {
  authorizeRoles,
  requireAdmin
};
