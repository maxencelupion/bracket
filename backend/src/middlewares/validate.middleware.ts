import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../config/logger.js';

export const validate =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logger.warn({ errors: z.treeifyError(result.error) }, 'Validation error');

      res.status(400).json({
        message: 'Validation error',
        error: z.treeifyError(result.error),
      });

      return;
    }

    req.body = result.data;
    next();
  };
