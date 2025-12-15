/** @file Express type augmentations */
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      // add userId property to request, just so typescript knows about it
      userId?: string;
    }
  }
}

/**
 * Request type for routes protected by `requireAuth` middleware.
 * The `userId` is guaranteed to be present after authentication.
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
}
