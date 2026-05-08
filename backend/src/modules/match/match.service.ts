import prisma from '../../config/prisma.js';
import logger from '../../config/logger.js';
import type { MatchResponseDto } from './match.dto.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { BracketState } from '../../../generated/prisma/enums.js';

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
      matchParticipants: {
        select: { id: true, playerId: true, side: true, score: true },
      },
    },
  });

  logger.info(`Match ${match.id} created in bracket ${bracketId}`);

  return match;
};
