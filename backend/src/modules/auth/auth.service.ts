import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma.js';
import { AppError } from '../../middlewares/error.middleware.js';

export const register = async (pseudo: string, email: string, password: string) => {
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

  return signToken(user.id);
};

export const login = async (password: string, email?: string, pseudo?: string) => {
  const where = email ? { email } : { pseudo: pseudo as string };
  const user = await prisma.user.findUnique({ where });

  if (!user) {
    throw new AppError('Invalid credentials', 401, { email, pseudo });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new AppError('Invalid credentials', 401, { email, pseudo });
  }

  return signToken(user.id);
};

const signToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
};
