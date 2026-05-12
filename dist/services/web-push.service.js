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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPushService = void 0;
const web_push_1 = __importDefault(require("web-push"));
const env_1 = require("../config/env");
const models_1 = require("../models");
const push_subscription_service_1 = require("./push-subscription.service");
let vapidConfigured = false;
const ensureVapidConfigured = () => {
    const { vapidPublicKey, vapidPrivateKey, vapidSubject } = env_1.env.webPush;
    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject)
        return false;
    if (!vapidConfigured) {
        web_push_1.default.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        vapidConfigured = true;
    }
    return true;
};
const isGoneStatus = (statusCode) => statusCode === 404 || statusCode === 410;
class WebPushService {
    static isConfigured() {
        return Boolean(env_1.env.webPush.vapidPublicKey &&
            env_1.env.webPush.vapidPrivateKey &&
            env_1.env.webPush.vapidSubject);
    }
    static getPublicKey() {
        return env_1.env.webPush.vapidPublicKey || null;
    }
    /**
     * Sends a Web Push to every stored subscription for the user. Invalid subscriptions are removed.
     */
    static sendToUser(user_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!ensureVapidConfigured())
                return;
            const subs = yield push_subscription_service_1.PushSubscriptionService.listForUser(user_id);
            if (subs.length === 0)
                return;
            const body = JSON.stringify({
                title: payload.title,
                body: payload.body,
                data: (_a = payload.data) !== null && _a !== void 0 ? _a : {},
            });
            yield Promise.all(subs.map((sub) => __awaiter(this, void 0, void 0, function* () {
                const subscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.keys_p256dh,
                        auth: sub.keys_auth,
                    },
                };
                try {
                    yield web_push_1.default.sendNotification(subscription, body, {
                        TTL: 60 * 60 * 12,
                        urgency: "normal",
                    });
                }
                catch (err) {
                    const statusCode = err && typeof err === "object" && "statusCode" in err
                        ? Number(err.statusCode)
                        : undefined;
                    if (isGoneStatus(statusCode)) {
                        yield models_1.PushSubscription.destroy({ where: { push_subscription_id: sub.push_subscription_id } });
                    }
                    else {
                        console.error("Web push send failed:", err);
                    }
                }
            })));
        });
    }
}
exports.WebPushService = WebPushService;
