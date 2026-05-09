import { NextFunction, Request, Response } from "express";

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler =
  (handler: AsyncController) => (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
