import type { NextFunction, Request, Response } from 'express';
import * as matchService from './match.service.js';
import type { CreateMatchDto } from './match.dto.js';

export const createMatchController = async (
  req: Request<{ bracketId: string }, unknown, CreateMatchDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const match = await matchService.createMatch(
      req.params.bracketId,
      req.body.round,
      req.body.participants
    );
    res.status(201).json({ match });
  } catch (err) {
    next(err);
  }
};
