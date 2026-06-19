const { signToken } = require('../config/jwt');
const { z } = require('zod');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// Zod Login request body validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address structure (e.g. name@domain.com)'),
  password: z.string().min(6, 'Password credentials must contain at least 6 characters')
});

/**
 * Checks credentials and issues JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Look up user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials. Please try again.'
      });
    }

    // Sign JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Login authenticated successfully!',
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns user profile parameters extracted from the auth middleware token.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
  loginSchema
};
