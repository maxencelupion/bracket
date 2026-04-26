import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { password, confirmPassword, ...safeBody } = req.body ?? {};

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
