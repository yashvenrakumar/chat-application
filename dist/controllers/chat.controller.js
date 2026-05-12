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
exports.ChatController = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const io_1 = require("../socket/io");
const group_service_1 = require("../services/group.service");
const presence_service_1 = require("../services/presence.service");
const chat_service_1 = require("../services/chat.service");
const messaging_notify_service_1 = require("../services/messaging-notify.service");
class ChatController {
    static sendGroupMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const payload = req.validated;
            const message = yield chat_service_1.ChatService.sendGroupMessage({
                group_id,
                sender_user_id: auth_user_id,
                message_text: payload.message_text,
            });
            yield messaging_notify_service_1.MessagingNotifyService.afterGroupMessage(message, auth_user_id);
            io_1.io.to(`group:${group_id}`).emit("group:message", message);
            res
                .status(201)
                .json((0, apiResponse_1.successResponse)("Group message sent successfully", message));
        });
    }
    static getGroupMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            const messages = yield chat_service_1.ChatService.getGroupMessages(group_id, auth_user_id);
            res
                .status(200)
                .json((0, apiResponse_1.successResponse)("Group messages fetched successfully", messages));
        });
    }
    static sendDirectMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const peer_user_id = Number(req.params.peer_user_id);
            const payload = req.validated;
            const message = yield chat_service_1.ChatService.sendDirectMessage({
                sender_user_id: auth_user_id,
                receiver_user_id: peer_user_id,
                message_text: payload.message_text,
            });
            yield messaging_notify_service_1.MessagingNotifyService.afterDirectMessage(message);
            io_1.io.to(`user:${peer_user_id}`).emit("direct:message", message);
            io_1.io.to(`user:${auth_user_id}`).emit("direct:message", message);
            res
                .status(201)
                .json((0, apiResponse_1.successResponse)("Direct message sent successfully", message));
        });
    }
    static getDirectMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const peer_user_id = Number(req.params.peer_user_id);
            const messages = yield chat_service_1.ChatService.getDirectMessages(auth_user_id, peer_user_id);
            res
                .status(200)
                .json((0, apiResponse_1.successResponse)("Direct messages fetched successfully", messages));
        });
    }
    static markSeen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const message_id = Number(req.params.message_id);
            const seen = yield chat_service_1.ChatService.markSeen(message_id, auth_user_id);
            const seenUsers = yield chat_service_1.ChatService.getMessageSeenUsers(message_id);
            io_1.io.emit("message:seen", { message_id, seen_users: seenUsers });
            res.status(200).json((0, apiResponse_1.successResponse)("Message marked as seen", seen));
        });
    }
    static groupOnline(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth_user_id = req.auth_user_id;
            const group_id = Number(req.params.group_id);
            yield group_service_1.GroupService.ensureMembership(group_id, auth_user_id);
            const online = presence_service_1.presenceService.getOnlineUsers(group_id);
            res.status(200).json((0, apiResponse_1.successResponse)("Group online users fetched successfully", {
                group_id,
                online_count: online.length,
                online_user_ids: online,
            }));
        });
    }
    static directOnline(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const peer_user_id = Number(req.params.peer_user_id);
            res.status(200).json((0, apiResponse_1.successResponse)("Direct user online status fetched successfully", {
                user_id: peer_user_id,
                is_online: presence_service_1.presenceService.isUserOnline(peer_user_id),
            }));
        });
    }
}
exports.ChatController = ChatController;
