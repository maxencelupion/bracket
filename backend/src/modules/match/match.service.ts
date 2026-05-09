import prisma from '../../config/prisma.js';
import logger from '../../config/logger.js';
import type { MatchResponseDto } from './match.dto.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { BracketState } from '../../../generated/prisma/enums.js';
import type { PaginatedResponse } from '../../types/pagination.js';

export const createMatch = async (
  bracketId: string,
  round: number,
  participants: { playerId: string; side: number }[]
): Promise<MatchResponseDto> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { state: true, participants: { select: { id: true } } },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { bracketId });
  }

  if (bracket.state !== BracketState.ONGOING) {
    throw new AppError('Bracket must be ongoing to create matches', 403, { bracketId });
  }

  const bracketParticipantIds = bracket.participants.map((p) => p.id);
  const invalidParticipants = participants.filter(
    (p) => !bracketParticipantIds.includes(p.playerId)
  );

  if (invalidParticipants.length > 0) {
    throw new AppError('Some players are not registered in this bracket', 400, {
      invalidParticipants,
    });
  }

  const match = await prisma.match.create({
    data: {
      bracketId,
      round,
      matchParticipants: {
        create: participants.map(({ playerId, side }) => ({ playerId, side })),
      },
    },
    select: {
      id: true,
      round: true,
      bracketId: true,
      finished: true,
      winnerId: true,
      matchParticipants: {
        select: { id: true, playerId: true, side: true, score: true },
      },
    },
  });

  logger.info(`Match ${match.id} created in bracket ${bracketId}`);

  return match;
};

export const getMatches = async (
  bracketId: string,
  page: number,
  limit: number
): Promise<PaginatedResponse<MatchResponseDto>> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { state: true, participants: { select: { id: true } } },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { bracketId });
  }

  // Page is min 1 default 1
  const skip = (page - 1) * limit;

  const [matches, totalItems] = await prisma.$transaction([
    prisma.match.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        round: true,
        bracketId: true,
        finished: true,
        winnerId: true,
        matchParticipants: {
          select: { id: true, playerId: true, side: true, score: true },
        },
      },
      where: { bracketId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bracket.count(),
  ]);

  logger.info(`Retrieve ${limit} match(es)`);

  return {
    data: matches,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      limit,
    },
  };
};

export const getMatchById = async (
  bracketId: string,
  matchId: string
): Promise<MatchResponseDto> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { state: true, participants: { select: { id: true } } },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { bracketId });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      round: true,
      bracketId: true,
      finished: true,
      winnerId: true,
      matchParticipants: {
        select: { id: true, playerId: true, side: true, score: true },
      },
    },
  });

  if (!match) {
    throw new AppError('Match not found', 404, { bracketId, matchId });
  }

  logger.info(`Retrieve match ${matchId} in bracket ${bracketId}`);

  return match;
};

export const editMatchById = async (
  bracketId: string,
  matchId: string,
  round?: number,
  finished?: boolean,
  winnerId?: string | null,
  participants?: { playerId: string; score: number }[]
): Promise<MatchResponseDto> => {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { state: true },
  });

  if (!bracket) {
    throw new AppError('Bracket not found', 404, { bracketId });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true },
  });

  if (!match) {
    throw new AppError('Match not found', 404, { bracketId, matchId });
  }

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: {
        ...(round !== undefined && { round }),
        ...(finished !== undefined && { finished }),
        ...(winnerId !== undefined && { winnerId }),
      },
    });

    if (participants) {
      await Promise.all(
        participants.map((p) =>
          tx.matchParticipant.updateMany({
            where: { matchId, playerId: p.playerId },
            data: { score: p.score },
          })
        )
      );
    }
  });

  const updatedMatch = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      round: true,
      bracketId: true,
      finished: true,
      winnerId: true,
      matchParticipants: {
        select: { id: true, playerId: true, side: true, score: true },
      },
    },
  });

  logger.info(`Edited match ${matchId} in bracket ${bracketId}`);

  return updatedMatch!;
};
