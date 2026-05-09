import { z } from 'zod';

export const createMatchDto = z.object({
  round: z.number().int().min(1),
  participants: z
    .array(
      z.object({
        playerId: z.string(),
        side: z.number().int().min(1),
      })
    )
    .min(2),
});

export const matchResponseDto = z.object({
  id: z.string(),
  round: z.number(),
  bracketId: z.string(),
  finished: z.boolean(),
  winnerId: z.string().nullable(),
  matchParticipants: z.array(
    z.object({
      id: z.string(),
      playerId: z.string(),
      side: z.number(),
      score: z.number().nullable(),
    })
  ),
});

export const editMatchDto = z
  .object({
    round: z.number().int().min(1).optional(),
    finished: z.boolean().optional(),
    winnerId: z.string().optional(),
    participants: z
      .array(
        z.object({
          playerId: z.string(),
          score: z.number().int().min(0),
        })
      )
      .min(2)
      .optional(),
  })
  .superRefine(({ round, finished, winnerId, participants }, ctx) => {
    if (!round && !finished && !winnerId && !participants) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be updated',
        path: ['participants'],
      });
    }
  });

export type CreateMatchDto = z.infer<typeof createMatchDto>;
export type MatchResponseDto = z.infer<typeof matchResponseDto>;
export type EditMatchDto = z.infer<typeof editMatchDto>;
