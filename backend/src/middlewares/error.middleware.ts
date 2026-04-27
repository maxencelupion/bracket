import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public provided?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, provided: err.provided });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
};
