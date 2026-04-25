// import type { Request, Response } from 'express';
// import User from '../models/User';
// import { generateToken } from '../utils/jwt';
// import { validationResult } from 'express-validator';

// export const register = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400).json({ errors: errors.array() });
//       return;
//     }

//     const { name, email, password } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       res.status(400).json({ message: 'Email already exists' });
//       return;
//     }

//     const user = await User.create({ name, email, password });
//     const token = generateToken({ id: user._id.toString(), role: user.role });

//     res.status(201).json({
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400).json({ errors: errors.array() });
//       return;
//     }

//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       res.status(401).json({ message: 'Invalid email or password' });
//       return;
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       res.status(401).json({ message: 'Invalid email or password' });
//       return;
//     }

//     const token = generateToken({ id: user._id.toString(), role: user.role });

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const getMe = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const user = await User.findById(req.user?.id);
//     if (!user) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }
//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens, sendRefreshTokenCookie } from '../utils/jwt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const user = await User.create({ name, email, password });

    // Generate both tokens
    const { accessToken, refreshToken } = generateTokens({ 
      _id: user._id.toString(), 
      role: user.role 
    });

    // Send Refresh Token via HTTP-only cookie
    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken, // Only send access token in JSON
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate both tokens
    const { accessToken, refreshToken } = generateTokens({ 
      _id: user._id.toString(), 
      role: user.role 
    });

    // Send Refresh Token via HTTP-only cookie
    sendRefreshTokenCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/auth/refresh-token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401).json({ message: 'Not authenticated, no refresh token' });
      return;
    }

    // Verify Refresh Token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET as string
    ) as JwtPayload;

    // Generate new set of tokens (Token Rotation for extra security)
    const tokens = generateTokens({ _id: decoded._id, role: decoded.role });

    // Update the Refresh Token cookie
    sendRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * @desc    Logout User / Clear Cookie
 * @route   POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

/**
 * @desc    Get Current User
 * @route   GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user comes from 'protect' middleware
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};