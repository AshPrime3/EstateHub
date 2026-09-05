import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { LoginInput } from '../validators/auth.schemas';

const prisma = new PrismaClient();

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  return user;
}
