import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';
import { env } from '../config/env.js';
import prisma from '../config/prisma.js';

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

export const isBracketOwner = async (
  req: Request<{ bracketId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const bracket = await prisma.bracket.findUnique({
      where: { id: req.params.bracketId },
      select: { ownerId: true },
    });

    if (!bracket) {
      return next(new AppError('Bracket not found', 404));
    }

    if (bracket.ownerId !== req.user!.userId) {
      return next(new AppError('Forbidden', 403));
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const isMatchParticipantOrOwner = async (
  req: Request<{ bracketId: string; matchId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId },
      select: {
        bracket: { select: { ownerId: true } },
        matchParticipants: { select: { playerId: true } },
      },
    });

    if (!match) {
      return next(new AppError('Match not found', 404));
    }
    const userId = req.user!.userId;
    const isOwner = match.bracket.ownerId === userId;

    if (isOwner) {
      next();
    }

    const isParticipant = match.matchParticipants.some((p) => p.playerId === userId);

    if (isParticipant) {
      next();
    }

    return next(new AppError('Forbidden', 403));
  } catch (err) {
    next(err);
  }
};
