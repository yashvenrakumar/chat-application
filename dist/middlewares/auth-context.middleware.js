"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserContext = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const requireUserContext = (req, res, next) => {
    const rawUserId = req.header("x-user-id");
    const user_id = Number(rawUserId);
    if (!rawUserId || Number.isNaN(user_id) || user_id <= 0) {
        res.status(401).json((0, apiResponse_1.errorResponse)("Missing or invalid x-user-id header"));
        return;
    }
    req.auth_user_id = user_id;
    next();
};
exports.requireUserContext = requireUserContext;
