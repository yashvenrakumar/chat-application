"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const notFoundMiddleware = (req, res) => {
    res.status(404).json((0, apiResponse_1.errorResponse)(`Route not found: ${req.originalUrl}`));
};
exports.notFoundMiddleware = notFoundMiddleware;
