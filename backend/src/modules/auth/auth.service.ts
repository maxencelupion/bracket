import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import type { ProfileDto } from './auth.dto.js';
import logger from '../../config/logger.js';

export const registerUser = async (pseudo: string, email: string, password: string) => {
  const existingEmail = await prisma.user.findUnique({ where: { email } });

  if (existingEmail) {
    throw new AppError('Email already in use', 409, { email });
  }

  const existingPseudo = await prisma.user.findUnique({ where: { pseudo } });

  if (existingPseudo) {
    throw new AppError('Pseudo already in use', 409, { pseudo });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { pseudo, email, password: hashed },
  });

  logger.info(`User with id ${user.id} created`);

  return signToken(user.id);
};

export const loginUser = async (password: string, email?: string, pseudo?: string) => {
  const where = email ? { email } : { pseudo: pseudo as string };
  const user = await prisma.user.findUnique({ where });

  if (!user) {
    throw new AppError('Invalid credentials', 401, { email, pseudo });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new AppError('Invalid credentials', 401, { email, pseudo });
  }

  logger.info(`User with id ${user.id} signed in`);

  return signToken(user.id);
};

export const editProfile = async (
  userId: string,
  password: string,
  email?: string,
  pseudo?: string,
  newPassword?: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404, { email, pseudo });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new AppError('Invalid credentials', 401, { email, pseudo });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(email && { email }),
      ...(pseudo && { pseudo }),
      ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
    },
  });

  logger.info(`User profile with id ${userId} edited`);
};

export const getProfile = async (userId: string): Promise<ProfileDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, pseudo: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info(`User profile with id ${userId} retrieved`);

  return user;
};

const signToken = (userId: string) => {
  return jwt.sign({ userId }, env.JWT_SECRET!, {
    expiresIn: env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
};
