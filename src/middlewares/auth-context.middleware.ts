import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse";

export const requireUserContext = (req: Request, res: Response, next: NextFunction): void => {
  const rawUserId = req.header("x-usr-id");
  const usr_id = Number(rawUserId);

  if (!rawUserId || Number.isNaN(usr_id) || usr_id <= 0) {
    res.status(401).json(errorResponse("Missing or invalid x-usr-id header"));
    return;
  }

  req.auth_usr_id = usr_id;
  next();
};
