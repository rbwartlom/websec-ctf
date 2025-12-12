/** @file Shared configuration and utilities */
import { NextFunction, Request, Response } from "express";

// ─── Environment ─────────────────────────────────────────────────────────────

export const PORT = Number(process.env.PORT) || 3000;
export const MONGODB_URI = process.env.MONGODB_URI ?? "";
export const JWT_SECRET = process.env.JWT_SECRET ?? "";

const REQUIRED_ENVS = ["MONGODB_URI", "JWT_SECRET"];
const PRODUCTION_ENVS = ["BASE_URL"];

export function checkENVs(): void {
  const required =
    process.env.NODE_ENV === "production"
      ? [...REQUIRED_ENVS, ...PRODUCTION_ENVS]
      : REQUIRED_ENVS;

  const missing = required.filter((env) => !process.env[env]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// ─── Error Handling ──────────────────────────────────────────────────────────

/**
 * Error class for expected failures that are safe to expose to clients.
 */
export class SafeError extends Error {
  constructor(
    message: string,
    public readonly responseCode: number = 500,
    shouldLog = true
  ) {
    super(message);
    if (shouldLog) console.error(this);
  }
}

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Wraps async route handlers to forward errors to Express error handler.
 */
export function handleAsyncErrors(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
