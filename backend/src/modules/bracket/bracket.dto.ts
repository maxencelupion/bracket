import { z } from 'zod';
import { BracketState } from '../../../generated/prisma/enums.js';

export const createDto = z.object({
  name: z.string().min(3).max(100),
  // Converts string into date type using coercion
  date: z.coerce.date().refine((date) => date >= new Date(), {
    message: 'Date must be in the future',
  }),
});

export const bracketResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  date: z.date(),
  state: z.enum(BracketState),
  ownerId: z.string(),
});

export type CreateDto = z.infer<typeof createDto>;
export type BracketResponseDto = z.infer<typeof bracketResponseDto>;
