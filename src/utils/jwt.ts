// import jwt from 'jsonwebtoken';
// import type { JwtPayload } from '../types/index';

// export const generateToken = (payload: JwtPayload): string => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) throw new Error('JWT_SECRET is not defined');

//   return jwt.sign(payload, secret, { expiresIn: '7d' });
// };

// export const verifyToken = (token: string): JwtPayload => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) throw new Error('JWT_SECRET is not defined');

//   return jwt.verify(token, secret) as JwtPayload;
// };

import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JwtPayload } from '../types/index';

export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};