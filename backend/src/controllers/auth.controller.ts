import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    // Set httpOnly cookies
    res.cookie('access_token', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, result.user, 'Login successful');
  } catch (error) {
    sendUnauthorized(res, error instanceof Error ? error.message : 'Login failed');
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      sendUnauthorized(res, 'Refresh token is required');
      return;
    }

    const result = await authService.refresh(refreshToken);

    res.cookie('access_token', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, null, 'Token refreshed');
  } catch (error) {
    sendUnauthorized(res, 'Invalid refresh token');
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
  sendSuccess(res, null, 'Logged out successfully');
}

export async function me(req: Request, res: Response) {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      sendUnauthorized(res);
      return;
    }
    sendSuccess(res, authReq.user, 'User info retrieved');
  } catch (error) {
    sendError(res, 'Failed to get user info', 500);
  }
}
