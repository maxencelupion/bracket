import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../config/logger.js';

const updateQuery = (req: Request, value: unknown) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    writable: false,
    value,
  });
};

export const validate =
  (schema: z.ZodType, target: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(target === 'query' ? req.query : req.body);

    if (!result.success) {
      logger.warn({ errors: z.treeifyError(result.error) }, 'Validation error');
      res.status(400).json({
        message: 'Validation error',
        error: z.treeifyError(result.error),
      });

      return;
    }

    if (target === 'query') {
      updateQuery(req, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };
