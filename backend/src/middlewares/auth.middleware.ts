import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid token', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Missing or invalid token', 401);
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
