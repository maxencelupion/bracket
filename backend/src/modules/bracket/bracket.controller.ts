import type { NextFunction, Request, Response } from 'express';
import * as bracketService from './bracket.service.js';
import type { CreateDto } from './bracket.dto.js';
import { paginationDto, type PaginationDto } from '../../types/pagination.js';

export const createBracketController = async (
  req: Request<{}, {}, CreateDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, date } = req.body;
    const bracket = await bracketService.createBracket(req.user!.userId, name, date);

    res.status(201).json({ bracket });
  } catch (err) {
    next(err);
  }
};

export const getBracketsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as unknown as PaginationDto;
    const result = await bracketService.getBrackets(page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
