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
    const { name, email, password } = req.body; // role ഇവിടെ എടുക്കുന്നില്ല (Security Fix)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // പുതിയ യൂസറെ ഉണ്ടാക്കുമ്പോൾ എപ്പോഴും role: 'user' ആയിരിക്കും
    const user = await User.create({ 
      name, 
      email, 
      password,
      role: 'user' 
    });

    const { accessToken, refreshToken } = generateTokens({ 
      _id: user._id.toString(), 
      role: user.role 
    });

    sendRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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

/**
 * @desc    Get All Users
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

// 1. ADD NEW ADDRESS
export const addAddress = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ആദ്യത്തെ അഡ്രസ്സ് ആണെങ്കിൽ അല്ലെങ്കിൽ നിലവിൽ default ഒന്നും ഇല്ലെങ്കിൽ ഇതിനെ default ആക്കുന്നു
        const hasDefault = user.addresses.some(addr => addr.isDefault);
        const newAddress = { ...req.body, isDefault: !hasDefault };

        user.addresses.push(newAddress as any);
        await user.save();
        res.status(201).json(user.addresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. SET DEFAULT ADDRESS
export const setDefaultAddress = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { addressId } = req.params;

        // 🔥 Fix: 'as any' ഉപയോഗിക്കുന്നത് വഴി TypeScript error ഒഴിവാക്കി
        const addressToSet = (user.addresses as any).id(addressId);
        
        if (!addressToSet) {
            return res.status(404).json({ message: 'Address not found or already deleted' });
        }

        user.addresses.forEach((addr: any) => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();
        res.json(user.addresses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. DELETE ADDRESS
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { addressId } = req.params;

        // 🔥 Fix: 'as any' ഉപയോഗിക്കുന്നത് വഴി TypeScript error ഒഴിവാക്കി
        const addressToDelete = (user.addresses as any).id(addressId);
        
        if (!addressToDelete) {
            return res.status(404).json({ message: 'Address already deleted' });
        }

        const wasDefault = addressToDelete.isDefault;

        // അഡ്രസ്സ് റിമൂവ് ചെയ്യുന്നു
        (user.addresses as any).pull(addressId);

        // ഡിലീറ്റ് ചെയ്തത് default ആണെങ്കിൽ അടുത്തതിനെ default ആക്കുന്നു
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ message: 'Address removed successfully', addresses: user.addresses });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};