import prisma from '../../config/prisma.js';
import logger from '../../config/logger.js';
import type { BracketResponseDto, ParticipantResponseDto } from './bracket.dto.js';
import type { PaginatedResponse } from '../../types/pagination.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { BracketState } from '../../../generated/prisma/enums.js';

export const createBracket = async (
  userId: string,
  name: string,
  date: Date
): Promise<BracketResponseDto> => {
  const bracket = await prisma.bracket.create({
    data: { name, date, ownerId: userId },
  });

  logger.info(`Bracket with id ${bracket.id} created`);

  return bracket;
};

export const getBrackets = async (
  page: number,
  limit: number
): Promise<PaginatedResponse<BracketResponseDto>> => {
  // Page is min 1 default 1
  const skip = (page - 1) * limit;
  console.log(page, limit);

  const [brackets, totalItems] = await prisma.$transaction([
    prisma.bracket.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        date: true,
        state: true,
        ownerId: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bracket.count(),
  ]);

  logger.info(`Retrieve ${limit} bracket(s)`);

  return {
    data: brackets,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      limit,
    },
  };
};

export const getBracketById = async (id: string): Promise<BracketResponseDto> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      date: true,
      state: true,
      ownerId: true,
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id });
  }

  logger.info(`Retrieve bracket with id ${id}`);

  return bracket;
};

export const editBracketById = async (
  userId: string,
  bracketId: string,
  name?: string,
  date?: Date
): Promise<BracketResponseDto> => {
  let bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: {
      id: true,
      name: true,
      date: true,
      state: true,
      ownerId: true,
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id: bracketId, name, date });
  }

  if (bracket.ownerId !== userId) {
    throw new AppError('User is not the owner of this bracket', 404, { id: bracketId, name, date });
  }

  bracket = await prisma.bracket.update({
    where: { id: bracketId },
    data: {
      ...(name && { name }),
      ...(date && { date }),
    },
  });

  logger.info(`Bracket with id ${bracketId} edited`);

  return bracket;
};

export const deleteBracketById = async (userId: string, bracketId: string) => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: {
      id: true,
      state: true,
      ownerId: true,
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id: bracketId });
  }

  if (bracket.ownerId !== userId) {
    throw new AppError('User is not the owner of this bracket', 404, { id: bracketId });
  }

  if (bracket.state == BracketState.ONGOING) {
    throw new AppError(`You can't delete an ongoing bracket`, 404, { id: bracketId });
  }

  await prisma.bracket.delete({
    where: { id: bracketId },
  });

  logger.info(`Bracket with id ${bracketId} deleted`);
};

export const joinBracketById = async (userId: string, bracketId: string) => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: {
      id: true,
      state: true,
      participants: {
        select: {
          id: true,
          pseudo: true,
        },
      },
      ownerId: true,
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id: bracketId });
  }

  if (bracket.state !== BracketState.OPENED) {
    throw new AppError(`You can only join an opened bracket`, 403, { id: bracketId });
  }

  for (const participant of bracket.participants) {
    if (userId === participant.id) {
      throw new AppError('User is already registered in this bracket', 409, { id: bracketId });
    }
  }

  await prisma.bracket.update({
    where: { id: bracketId },
    data: {
      participants: {
        connect: { id: userId },
      },
    },
  });

  logger.info(`User with id ${userId} joined bracket with id ${bracketId}`);
};

export const getParticipantsById = async (
  bracketId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<ParticipantResponseDto>> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { id: true },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { bracketId });
  }

  const skip = (page - 1) * limit;

  const [participants, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, pseudo: true },
      where: { brackets: { some: { id: bracketId } } },
    }),
    prisma.user.count({
      where: { brackets: { some: { id: bracketId } } },
    }),
  ]);

  logger.info(`Retrieved ${participants.length} participant(s) in bracket with id ${bracketId}`);

  return {
    data: participants,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      limit,
    },
  };
};
