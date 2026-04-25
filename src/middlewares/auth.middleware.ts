// import type { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/jwt';

// export const protect = (req: Request, res: Response, next: NextFunction): void => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       res.status(401).json({ message: 'No token, unauthorized' });
//       return;
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       res.status(401).json({ message: 'No token, unauthorized' });
//       return;
//     }

//     const decoded = verifyToken(token);
//     req.user = decoded;
//     next();
//   } catch {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
//   if (req.user?.role !== 'admin') {
//     res.status(403).json({ message: 'Admin access only' });
//     return;
//   }
//   next();
// };

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token, unauthorized' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Backend-il access token verify cheyyan Access Secret upayogikanam
    const decoded = jwt.verify(
      token, 
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access only' });
    return;
  }
  next();
};