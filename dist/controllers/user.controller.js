"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const user_service_1 = require("../services/user.service");
const parsePageQuery = (raw) => {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};
const parseLimitQuery = (raw, fallback) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1)
        return fallback;
    return Math.floor(n);
};
class UserController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.validated;
            const user = yield user_service_1.UserService.createUser(Object.assign({}, body));
            res.status(201).json((0, apiResponse_1.successResponse)("User created successfully", user));
        });
    }
    static getAll(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_service_1.UserService.listUsers();
            res.status(200).json((0, apiResponse_1.successResponse)("Users fetched successfully", users));
        });
    }
    /** Paginated users for direct messaging (excludes current user). Query: `page`, `limit` (default 10, max 50). */
    static listDirectory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const page = parsePageQuery(req.query.page);
            const limit = Math.min(parseLimitQuery(req.query.limit, 10), 50);
            const data = yield user_service_1.UserService.listUsersDirectory({
                exclude_user_id: auth_user_id,
                page,
                limit,
            });
            res.status(200).json((0, apiResponse_1.successResponse)("User directory fetched successfully", data));
        });
    }
}
exports.UserController = UserController;
