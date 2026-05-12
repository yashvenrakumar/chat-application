"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const env_1 = require("../config/env");
const apiResponse_1 = require("../utils/apiResponse");
const httpError_1 = require("../utils/httpError");
const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err instanceof httpError_1.HttpError ? err.statusCode : err.statusCode || 500;
    const safeForClient = statusCode < 500;
    const message = safeForClient || env_1.env.nodeEnv !== "production"
        ? err.message || "Internal server error"
        : "Internal server error";
    res.status(statusCode).json((0, apiResponse_1.errorResponse)(message));
};
exports.errorMiddleware = errorMiddleware;
