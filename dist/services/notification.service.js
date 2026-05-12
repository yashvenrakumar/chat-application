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
exports.NotificationService = void 0;
const models_1 = require("../models");
const httpError_1 = require("../utils/httpError");
class NotificationService {
    static createNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            return models_1.Notification.create(Object.assign(Object.assign({}, payload), { group_id: (_a = payload.group_id) !== null && _a !== void 0 ? _a : null, related_user_id: (_b = payload.related_user_id) !== null && _b !== void 0 ? _b : null }));
        });
    }
    static listNotificationsPaginated(user_id_1, page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, page, limit, status = "all") {
            const safeLimit = Math.min(Math.max(limit, 1), 50);
            const safePage = Math.max(page, 1);
            const offset = (safePage - 1) * safeLimit;
            const where = status === "read"
                ? { user_id, is_read: true }
                : status === "unread"
                    ? { user_id, is_read: false }
                    : { user_id };
            const [items, total, unread_count] = yield Promise.all([
                models_1.Notification.findAll({
                    where,
                    order: [["created_at", "DESC"]],
                    limit: safeLimit,
                    offset,
                }),
                models_1.Notification.count({ where }),
                models_1.Notification.count({ where: { user_id, is_read: false } }),
            ]);
            return {
                items,
                total,
                unread_count,
                page: safePage,
                limit: safeLimit,
                total_pages: Math.max(1, Math.ceil(total / safeLimit)),
                status,
            };
        });
    }
    static markRead(ntf_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield models_1.Notification.findOne({ where: { ntf_id, user_id } });
            if (!notification)
                throw new httpError_1.HttpError(404, "Notification not found");
            notification.is_read = true;
            yield notification.save();
            return notification;
        });
    }
}
exports.NotificationService = NotificationService;
