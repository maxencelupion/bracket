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

  logger.info(`Bracket ${bracket.id} created`);

  return { ...bracket, participantsNumber: 0 };
};

export const getBrackets = async (
  page: number,
  limit: number
): Promise<PaginatedResponse<BracketResponseDto>> => {
  // Page is min 1 default 1
  const skip = (page - 1) * limit;

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
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bracket.count(),
  ]);

  logger.info(`Retrieve ${limit} bracket(s)`);

  return {
    data: brackets.map((bracket) => ({
      ...bracket,
      participantsNumber: bracket._count.participants,
      _count: undefined,
    })),
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
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id });
  }

  logger.info(`Retrieved bracket ${id}`);

  const { _count, ...rest } = bracket;

  return { ...rest, participantsNumber: _count.participants };
};

export const editBracketById = async (
  userId: string,
  bracketId: string,
  name?: string,
  date?: Date,
  state?: BracketState
): Promise<BracketResponseDto> => {
  const bracket = await prisma.bracket.findUnique({
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

  const updated = await prisma.bracket.update({
    where: { id: bracketId },
    data: {
      ...(name && { name }),
      ...(date && { date }),
      ...(state && { state }),
    },
    select: {
      id: true,
      name: true,
      date: true,
      state: true,
      ownerId: true,
      _count: {
        select: { participants: true },
      },
    },
  });

  logger.info(`Bracket ${bracketId} edited`);

  const { _count, ...rest } = updated;

  return { ...rest, participantsNumber: _count.participants };
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
    throw new AppError('User is not the owner of this bracket', 403, { id: bracketId });
  }

  if (bracket.state == BracketState.ONGOING) {
    throw new AppError(`You can't delete an ongoing bracket`, 404, { id: bracketId });
  }

  await prisma.bracket.delete({
    where: { id: bracketId },
  });

  logger.info(`Bracket ${bracketId} deleted`);
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

  logger.info(`User ${userId} joined bracket ${bracketId}`);
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

  logger.info(`Retrieved ${participants.length} participant(s) in bracket ${bracketId}`);

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

export const leaveBracketById = async (userId: string, bracketId: string) => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: {
      id: true,
      state: true,
      ownerId: true,
      participants: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id: bracketId });
  }

  if (bracket.participants.length === 0) {
    throw new AppError('User is not a participant of this bracket', 404, {
      id: bracketId,
      userId,
    });
  }

  if (bracket.state !== BracketState.OPENED) {
    throw new AppError('You can only leave an opened bracket', 403, { id: bracketId });
  }

  if (bracket.ownerId === userId) {
    await prisma.bracket.delete({ where: { id: bracketId } });
    logger.info(`Bracket ${bracketId} deleted because owner left`);

    return;
  }

  await prisma.bracket.update({
    where: { id: bracketId },
    data: { participants: { disconnect: { id: userId } } },
  });

  logger.info(`User ${userId} left bracket ${bracketId}`);
};

export const excludeParticipantById = async (
  ownerId: string,
  bracketId: string,
  targetUserId: string
) => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: {
      id: true,
      state: true,
      ownerId: true,
      participants: {
        where: { id: targetUserId },
        select: { id: true },
      },
    },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { id: bracketId });
  }

  if (bracket.participants.length === 0) {
    throw new AppError('User is not a participant of this bracket', 404, {
      id: bracketId,
      targetUserId,
    });
  }

  if (bracket.ownerId !== ownerId) {
    throw new AppError('Only the owner can exclude participants', 403, { id: bracketId });
  }

  if (bracket.state !== BracketState.OPENED) {
    // TODO: Handle state ONGOING and sets every participant's matches statues to lost
    throw new AppError('You can only exclude from an opened bracket', 403, { id: bracketId });
  }

  if (ownerId === targetUserId) {
    throw new AppError('Owner cannot exclude themselves, use leave instead', 400, {
      id: bracketId,
    });
  }

  await prisma.bracket.update({
    where: { id: bracketId },
    data: { participants: { disconnect: { id: targetUserId } } },
  });

  logger.info(`User ${targetUserId} excluded from bracket ${bracketId} by owner ${ownerId}`);
};
