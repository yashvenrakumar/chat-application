"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const validateBody = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
    });
    if (error) {
        res.status(400).json((0, apiResponse_1.errorResponse)("Validation failed", error.details.map((detail) => detail.message)));
        return;
    }
    req.validated = value;
    next();
};
exports.validateBody = validateBody;
