export interface JwtPayload {
  _id: string; // 'id' maatti '_id' aakkuka
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}