"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (message, data) => ({
    success: true,
    message,
    data,
});
exports.successResponse = successResponse;
const errorResponse = (message, errors) => ({
    success: false,
    message,
    errors,
});
exports.errorResponse = errorResponse;
