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
  participantsNumber: z.number(),
  matchsNumber: z.number(),
});

export const editDto = z
  .object({
    name: z.string().min(3).max(100).optional(),
    date: z.coerce
      .date()
      .refine((date) => date >= new Date(), {
        message: 'Date must be in the future',
      })
      .optional(),
    state: z.enum(BracketState).optional(),
  })
  .superRefine(({ name, date, state }, ctx) => {
    if (!name && !date && !state) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be updated',
        path: ['bracket'],
      });
    }
  });

export const participantResponseDto = z.object({
  id: z.string(),
  pseudo: z.string(),
});

export type CreateDto = z.infer<typeof createDto>;
export type BracketResponseDto = z.infer<typeof bracketResponseDto>;
export type EditDto = z.infer<typeof editDto>;
export type ParticipantResponseDto = z.infer<typeof participantResponseDto>;
