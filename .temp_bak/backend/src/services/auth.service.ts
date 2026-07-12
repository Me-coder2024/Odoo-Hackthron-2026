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

interface LoginTracker {
  failedAttempts: number;
  lockedUntil: Date | null;
}

const loginTrackers = new Map<string, LoginTracker>();

export async function login(usernameOrEmail: string, password: string): Promise<LoginResult> {
  const normalizedKey = usernameOrEmail.toLowerCase().trim();

  // 1. Email domain check
  if (normalizedKey.includes('@') && !normalizedKey.endsWith('@transitops.com')) {
    throw new Error('Email must be from the @transitops.com domain');
  }

  // 2. Lockout check
  const tracker = loginTrackers.get(normalizedKey) || { failedAttempts: 0, lockedUntil: null };
  if (tracker.lockedUntil && tracker.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((tracker.lockedUntil.getTime() - Date.now()) / 60000);
    throw new Error(`Account locked due to 5 failed attempts. Please try again in ${minutesLeft} minute(s).`);
  }

  // 3. User lookup (support both username and email)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ]
    }
  });

  if (!user) {
    tracker.failedAttempts += 1;
    if (tracker.failedAttempts >= 5) {
      tracker.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      loginTrackers.set(normalizedKey, tracker);
      throw new Error('Account locked due to 5 failed attempts.');
    }
    loginTrackers.set(normalizedKey, tracker);
    throw new Error(`Invalid credentials. (${5 - tracker.failedAttempts} attempt(s) remaining)`);
  }

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // 4. Password validation
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    tracker.failedAttempts += 1;
    if (tracker.failedAttempts >= 5) {
      tracker.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      loginTrackers.set(normalizedKey, tracker);
      throw new Error('Account locked due to 5 failed attempts.');
    }
    loginTrackers.set(normalizedKey, tracker);
    throw new Error(`Invalid credentials. (${5 - tracker.failedAttempts} attempt(s) remaining)`);
  }

  // 5. Success -> Reset tracker
  loginTrackers.delete(normalizedKey);

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
