/** @file JWT authentication middleware */
import { Request, Response, NextFunction } from "express";
import { handleAsyncErrors, SafeError } from "./config.js";
import { verifyToken } from "./utils/jwt.js";

/**
 * Extracts Bearer token from Authorization header.
 */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Middleware that requires a valid JWT token.
 * Attaches `userId` to the request object.
 */
export const requireAuth = handleAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      throw new SafeError("Missing authorization token", 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new SafeError("Invalid or expired token", 401);
    }

    req.userId = payload.userId;
    next();
  }
);
