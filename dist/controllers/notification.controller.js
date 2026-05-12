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
exports.NotificationController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const notification_service_1 = require("../services/notification.service");
const httpError_1 = require("../utils/httpError");
const push_subscription_service_1 = require("../services/push-subscription.service");
const web_push_service_1 = require("../services/web-push.service");
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
const parseNotificationStatus = (raw) => {
    if (raw === "read" || raw === "unread")
        return raw;
    return "all";
};
class NotificationController {
    /** Public: browser needs the VAPID public key before `pushManager.subscribe`. */
    static vapidPublicKey(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKey = web_push_service_1.WebPushService.getPublicKey();
            if (!publicKey) {
                throw new httpError_1.HttpError(503, "Web Push is not configured (set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)");
            }
            res.status(200).json((0, apiResponse_1.successResponse)("VAPID public key", { publicKey }));
        });
    }
    static pushSubscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const body = req.validated;
            const row = yield push_subscription_service_1.PushSubscriptionService.upsertForUser(auth_user_id, body);
            res.status(200).json((0, apiResponse_1.successResponse)("Push subscription saved", { push_subscription_id: row.push_subscription_id }));
        });
    }
    static pushUnsubscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const body = req.validated;
            if (body.endpoint) {
                const removed = yield push_subscription_service_1.PushSubscriptionService.removeByEndpoint(auth_user_id, body.endpoint);
                res.status(200).json((0, apiResponse_1.successResponse)("Push subscription removed", { removed }));
                return;
            }
            const removed = yield push_subscription_service_1.PushSubscriptionService.removeAllForUser(auth_user_id);
            res.status(200).json((0, apiResponse_1.successResponse)("All push subscriptions removed", { removed }));
        });
    }
    static list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const page = parsePageQuery(req.query.page);
            const limit = Math.min(parseLimitQuery(req.query.limit, 10), 50);
            const status = parseNotificationStatus(req.query.status);
            const data = yield notification_service_1.NotificationService.listNotificationsPaginated(auth_user_id, page, limit, status);
            res.status(200).json((0, apiResponse_1.successResponse)("Notifications fetched successfully", data));
        });
    }
    static markRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const ntf_id = Number(req.params.ntf_id);
            const notification = yield notification_service_1.NotificationService.markRead(ntf_id, auth_user_id);
            res.status(200).json((0, apiResponse_1.successResponse)("Notification marked as read", notification));
        });
    }
}
exports.NotificationController = NotificationController;
