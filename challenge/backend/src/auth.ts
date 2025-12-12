/** @file Authorization middleware and functions */
import { NextFunction, Request, Response } from "express";
import { handleAsyncErrors, SafeError } from "./config.js";

export const authMiddleWare = handleAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const authorized = true; //TODO: implement authorization logic as required (e.g. OAuth, Password, API Key etc.)
    if(!authorized){
        throw new SafeError("Unauthorized", 401);
    }
    next();
})