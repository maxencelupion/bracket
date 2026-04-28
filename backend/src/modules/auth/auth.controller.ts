import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import type { RegisterDto, LoginDto, EditDto } from './auth.dto.js';

export const registerController = async (
  req: Request<{}, {}, RegisterDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pseudo, email, password } = req.body;
    const token = await authService.registerUser(pseudo, email, password);

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
    const token = await authService.loginUser(password, email, pseudo);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

export const editController = async (
  req: Request<{}, {}, EditDto>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, pseudo, password, newPassword } = req.body;

    await authService.editProfile(req.user!.userId, password, email, pseudo, newPassword);
    res.status(200).json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getProfile(req.user!.userId);

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};
