import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors.js'
import { env } from '../config/env.js'

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  console.error(err)
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
    code: 'INTERNAL_ERROR',
  })
}
