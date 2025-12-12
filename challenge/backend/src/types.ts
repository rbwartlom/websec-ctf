/** @file Express type augmentations */

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
