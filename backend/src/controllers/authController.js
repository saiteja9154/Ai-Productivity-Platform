import authService from '../services/authService.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user credentials and return JWT
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login
};
