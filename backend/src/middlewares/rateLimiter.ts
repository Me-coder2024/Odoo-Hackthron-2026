import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

const rateLimiter = new RateLimiterMemory({
  points: 500,
  duration: 60,
});

const authRateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

export async function globalRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  try {
    const key = req.ip || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }
}

export async function authRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  try {
    const key = req.ip || 'unknown';
    await authRateLimiter.consume(key);
    next();
  } catch {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
    });
  }
}
