import prisma from '../models/prisma';
import { comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';

interface LoginResult {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    username: user.username,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(refreshTokenStr);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.is_active) {
    throw new Error('User not found or deactivated');
  }

  const newPayload: TokenPayload = {
    userId: user.id,
    role: user.role,
    username: user.username,
  };

  return {
    accessToken: generateAccessToken(newPayload),
    refreshToken: generateRefreshToken(newPayload),
  };
}
