import type { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { password, confirmPassword, newPassword, ...safeBody } = req.body ?? {};

  logger.info(
    {
      method: req.method,
      url: req.url,
      body: safeBody,
    },
    'Incoming request'
  );

  next();
};
