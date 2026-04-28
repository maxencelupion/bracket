import prisma from '../../config/prisma.js';
import logger from '../../config/logger.js';
import type { BracketResponseDto } from './bracket.dto.js';
import type { PaginatedResponse } from '../../types/pagination.js';

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
