import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { errorResponse } from "../utils/apiResponse";

export const validateBody =
  (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json(
        errorResponse(
          "Validation failed",
          error.details.map((detail) => detail.message)
        )
      );
      return;
    }

    req.validated = value;
    next();
  };
