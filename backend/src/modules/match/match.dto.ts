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
  matchParticipants: z.array(
    z.object({
      id: z.string(),
      playerId: z.string(),
      side: z.number(),
      score: z.number().nullable(),
    })
  ),
});

export type CreateMatchDto = z.infer<typeof createMatchDto>;
export type MatchResponseDto = z.infer<typeof matchResponseDto>;
