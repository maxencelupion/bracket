import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const registerDto = z
  .object({
    pseudo: z.string().min(3).max(30),
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export const loginDto = z
  .object({
    email: z.email().optional(),
    pseudo: z.string().min(3).max(30).optional(),
    password: z.string().min(1),
  })
  .superRefine(({ email, pseudo }, ctx) => {
    if (!email && !pseudo) {
      ctx.addIssue({
        code: 'custom',
        message: 'Either email or pseudo is required',
        path: ['email'],
      });
    }
    if (email && pseudo) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide either email or pseudo, not both',
        path: ['email'],
      });
    }
  });

export const editDto = z
  .object({
    email: z.email().optional(),
    pseudo: z.string().min(3).max(30).optional(),
    password: z.string().min(1),
    newPassword: passwordSchema.optional(),
  })
  .superRefine(({ email, pseudo, newPassword }, ctx) => {
    if (!email && !pseudo && !newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be updated',
        path: ['email'],
      });
    }
  });

export const profileDto = z
  .object({
    email: z.email().optional(),
    pseudo: z.string().min(3).max(30).optional(),
  })
  .superRefine(({ email, pseudo }, ctx) => {
    if (!email && !pseudo) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be returned',
        path: ['email'],
      });
    }
  });

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type EditDto = z.infer<typeof editDto>;
export type ProfileDto = z.infer<typeof profileDto>;
