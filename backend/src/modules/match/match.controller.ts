import type { NextFunction, Request, Response } from 'express';
import * as matchService from './match.service.js';
import type { CreateMatchDto, EditMatchDto } from './match.dto.js';
import type { PaginationDto } from '../../types/pagination.js';

export const createMatchController = async (
  req: Request<{ bracketId: string }, unknown, CreateMatchDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { round, participants } = req.body;

    const match = await matchService.createMatch(req.params.bracketId, round, participants);

    res.status(201).json({ match });
  } catch (err) {
    next(err);
  }
};

export const getMatchesController = async (
  req: Request<{ bracketId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query as unknown as PaginationDto;
    const result = await matchService.getMatches(req.params.bracketId, page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getMatchByIdController = async (
  req: Request<{ bracketId: string; matchId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const match = await matchService.getMatchById(req.params.bracketId, req.params.matchId);

    res.status(200).json(match);
  } catch (err) {
    next(err);
  }
};

export const editMatchByIdController = async (
  req: Request<{ bracketId: string; matchId: string }, unknown, EditMatchDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { round, finished, winnerId, participants } = req.body;

    const match = await matchService.editMatchById(
      req.params.bracketId,
      req.params.matchId,
      round,
      finished,
      winnerId,
      participants
    );

    res.status(200).json(match);
  } catch (err) {
    next(err);
  }
};
