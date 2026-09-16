import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token
 * @param {Object} payload - User context data (e.g. { userId, email, role })
 * @param {Object} options - Optional jwt sign options (e.g. expiresIn)
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload, options = {}) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_productivity_2026';
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn
  });
};

/**
 * Verifies a JWT token
 * @param {string} token - The raw JWT token
 * @returns {Object} - Decoded payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_key_productivity_2026';
  return jwt.verify(token, secret);
};

export default {
  generateToken,
  verifyToken
};
