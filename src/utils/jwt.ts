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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};