import { Response } from 'express';

export function sendSuccess(res: Response, data: unknown, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendCreated(res: Response, data: unknown, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
}

export function sendNotFound(res: Response, entity = 'Resource') {
  return sendError(res, `${entity} not found`, 404);
}

export function sendUnauthorized(res: Response, message = 'Unauthorized') {
  return sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = 'Forbidden') {
  return sendError(res, message, 403);
}

export function sendConflict(res: Response, message: string) {
  return sendError(res, message, 409);
}

export function sendValidationError(res: Response, errors: unknown) {
  return sendError(res, 'Validation failed', 422, errors);
}
