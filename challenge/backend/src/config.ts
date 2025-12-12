/** @file Shared general-purpose logic and configurations */

import { NextFunction, Request, Response } from "express";

export const PORT = process.env.PORT || 3000;

export const checkENVs = () => {
  const requiredENVs: string[] = 
    process.env.NODE_ENV === 'production' 
      ? ['BASE_URL'] 
      : [];
  // ...rest of function
};

export class SafeError extends Error {
  public responseCode: number;
  constructor(message: string, responseCode: number = 500, shouldLog = true) {
    super(message);
    this.responseCode = responseCode; 
    shouldLog && console.error(this); // can be refactored to use a more sophisticated logger
  }
}


type AsyncRouteHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;
export function handleAsyncErrors<T>(fn: AsyncRouteHandler<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}