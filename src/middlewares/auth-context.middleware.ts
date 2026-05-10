import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse";

export const requireUserContext = (req: Request, res: Response, next: NextFunction): void => {
  const rawUserId = req.header("x-user-id");
  const user_id = Number(rawUserId);

  if (!rawUserId || Number.isNaN(user_id) || user_id <= 0) {
    res.status(401).json(errorResponse("Missing or invalid x-user-id header"));
    return;
  }

  req.auth_user_id = user_id;
  next();
};
