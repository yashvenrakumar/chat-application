import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { errorResponse } from "../utils/apiResponse";
import { HttpError } from "../utils/httpError";

type AppError = Error & {
  statusCode?: number;
};

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof HttpError ? err.statusCode : err.statusCode || 500;
  const safeForClient = statusCode < 500;
  const message =
    safeForClient || env.nodeEnv !== "production"
      ? err.message || "Internal server error"
      : "Internal server error";

  res.status(statusCode).json(errorResponse(message));
};
