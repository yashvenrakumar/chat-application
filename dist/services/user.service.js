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
exports.UserService = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = require("../models/user.model");
const presence_service_1 = require("./presence.service");
class UserService {
    static createUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(payload);
            return user;
        });
    }
    static listUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.User.findAll({
                order: [["user_id", "DESC"]],
            });
        });
    }
    static listUsersDirectory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { exclude_user_id, page, limit } = params;
            const safeLimit = Math.min(Math.max(limit, 1), 50);
            const safePage = Math.max(page, 1);
            const offset = (safePage - 1) * safeLimit;
            const { count, rows } = yield user_model_1.User.findAndCountAll({
                where: { user_id: { [sequelize_1.Op.ne]: exclude_user_id } },
                order: [["user_id", "DESC"]],
                limit: safeLimit,
                offset,
            });
            const items = rows.map((u) => {
                const raw = u.get({ plain: true });
                return {
                    user_id: raw.user_id,
                    first_name: raw.first_name,
                    last_name: raw.last_name,
                    email_id: raw.email_id,
                    is_active: raw.is_active,
                    is_online: presence_service_1.presenceService.isUserOnline(raw.user_id),
                };
            });
            const total = count;
            const total_pages = Math.max(1, Math.ceil(total / safeLimit));
            return {
                items,
                total,
                page: safePage,
                limit: safeLimit,
                total_pages,
            };
        });
    }
}
exports.UserService = UserService;
