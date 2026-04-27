import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

export const registerController = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pseudo, email, password } = req.body;
    const token = await authService.register(pseudo, email, password);

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, pseudo, password } = req.body;
    const token = await authService.login(password, email, pseudo);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};
