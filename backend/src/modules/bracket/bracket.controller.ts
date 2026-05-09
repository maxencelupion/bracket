import type { NextFunction, Request, Response } from 'express';
import * as bracketService from './bracket.service.js';
import type { CreateBracketDto, EditBracketDto } from './bracket.dto.js';
import type { PaginationDto } from '../../types/pagination.js';

export const createBracketController = async (
  req: Request<unknown, unknown, CreateBracketDto>,
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

export const getBracketByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const bracket = await bracketService.getBracketById(req.params.id);

    res.status(200).json(bracket);
  } catch (err) {
    next(err);
  }
};

export const editBracketByIdController = async (
  req: Request<{ id: string }, unknown, EditBracketDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, date, state } = req.body;
    const bracket = await bracketService.editBracketById(
      req.user!.userId,
      req.params.id,
      name,
      date,
      state
    );

    res.status(200).json(bracket);
  } catch (err) {
    next(err);
  }
};

export const deleteBracketByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await bracketService.deleteBracketById(req.user!.userId, req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const joinBracketByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await bracketService.joinBracketById(req.user!.userId, req.params.id);

    res.status(201).send();
  } catch (err) {
    next(err);
  }
};

export const getParticipantsByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit } = req.query as unknown as PaginationDto;
    const result = await bracketService.getParticipantsById(req.params.id, page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const leaveBracketByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await bracketService.leaveBracketById(req.user!.userId, req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const excludeParticipantByIdController = async (
  req: Request<{ id: string; userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await bracketService.excludeParticipantById(req.user!.userId, req.params.id, req.params.userId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
