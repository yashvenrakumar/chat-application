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
exports.MessagingNotifyService = void 0;
const presence_service_1 = require("./presence.service");
const notification_service_1 = require("./notification.service");
const web_push_service_1 = require("./web-push.service");
const chat_service_1 = require("./chat.service");
/**
 * When the recipient has an active Socket.IO connection we rely on real-time delivery only.
 * Otherwise we persist an in-app notification and attempt Web Push (if VAPID and subscriptions exist).
 */
class MessagingNotifyService {
    static deliverOfflineOnly(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (presence_service_1.presenceService.isUserOnline(payload.user_id))
                return;
            yield notification_service_1.NotificationService.createNotification({
                user_id: payload.user_id,
                ntf_type: payload.ntf_type,
                ntf_title: payload.ntf_title,
                ntf_body: payload.ntf_body,
                group_id: (_a = payload.group_id) !== null && _a !== void 0 ? _a : null,
                related_user_id: (_b = payload.related_user_id) !== null && _b !== void 0 ? _b : null,
            });
            if (!web_push_service_1.WebPushService.isConfigured())
                return;
            yield web_push_service_1.WebPushService.sendToUser(payload.user_id, {
                title: payload.ntf_title,
                body: payload.ntf_body,
                data: payload.pushData,
            });
        });
    }
    static afterGroupMessage(message, sender_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const group_id = message.group_id;
            if (group_id == null)
                return;
            const memberIds = yield chat_service_1.ChatService.listGroupMemberIds(group_id);
            const recipients = memberIds.filter((id) => id !== sender_user_id);
            const bodyPreview = message.message_text.slice(0, 120);
            yield Promise.all(recipients.map((user_id) => this.deliverOfflineOnly({
                user_id,
                ntf_type: "group",
                ntf_title: "New group message",
                ntf_body: bodyPreview,
                group_id,
                pushData: {
                    kind: "group_message",
                    message_id: String(message.message_id),
                    group_id: String(group_id),
                },
            })));
        });
    }
    static afterDirectMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const receiver_user_id = message.receiver_user_id;
            const sender_user_id = message.sender_user_id;
            if (receiver_user_id == null)
                return;
            const bodyPreview = message.message_text.slice(0, 120);
            yield this.deliverOfflineOnly({
                user_id: receiver_user_id,
                ntf_type: "direct",
                ntf_title: "New direct message",
                ntf_body: bodyPreview,
                related_user_id: sender_user_id,
                pushData: {
                    kind: "direct_message",
                    message_id: String(message.message_id),
                    sender_user_id: String(sender_user_id),
                },
            });
        });
    }
}
exports.MessagingNotifyService = MessagingNotifyService;
