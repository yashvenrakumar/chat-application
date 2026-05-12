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
exports.registerSocketEvents = void 0;
const chat_service_1 = require("../services/chat.service");
const group_service_1 = require("../services/group.service");
const presence_service_1 = require("../services/presence.service");
const emit_user_presence_1 = require("./emit-user-presence");
const messaging_notify_service_1 = require("../services/messaging-notify.service");
const registerSocketEvents = (socketServer) => {
    socketServer.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const user_id = Number((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.user_id);
        if (!user_id || Number.isNaN(user_id)) {
            socket.disconnect();
            return;
        }
        presence_service_1.presenceService.addSocket(user_id, socket.id);
        socket.join(`user:${user_id}`);
        const groups = yield group_service_1.GroupService.listMyGroups(user_id);
        const groupIds = groups.map((g) => Number(g.group_id));
        (0, emit_user_presence_1.emitUserPresence)(socketServer, user_id, { user_id, is_online: true }, groupIds);
        groups.forEach((group) => {
            const group_id = Number(group.group_id);
            socket.join(`group:${group_id}`);
            presence_service_1.presenceService.joinGroup(user_id, group_id);
            socketServer.to(`group:${group_id}`).emit("group:presence", {
                group_id,
                online_cnt: presence_service_1.presenceService.getOnlineCount(group_id),
            });
        });
        socket.on("chat:group:send", (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_service_1.ChatService.sendGroupMessage({
                group_id: payload.group_id,
                sender_user_id: user_id,
                message_text: payload.message_text,
            });
            yield messaging_notify_service_1.MessagingNotifyService.afterGroupMessage(message, user_id);
            const plain = message.get({ plain: true });
            socketServer.to(`group:${payload.group_id}`).emit("group:message", plain);
        }));
        socket.on("chat:direct:send", (payload) => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_service_1.ChatService.sendDirectMessage({
                sender_user_id: user_id,
                receiver_user_id: payload.receiver_user_id,
                message_text: payload.message_text,
            });
            yield messaging_notify_service_1.MessagingNotifyService.afterDirectMessage(message);
            const plain = message.get({ plain: true });
            socketServer.to(`user:${user_id}`).emit("direct:message", plain);
            socketServer.to(`user:${payload.receiver_user_id}`).emit("direct:message", plain);
        }));
        socket.on("disconnect", () => {
            presence_service_1.presenceService.removeSocket(user_id, socket.id);
            (0, emit_user_presence_1.emitUserPresence)(socketServer, user_id, {
                user_id,
                is_online: presence_service_1.presenceService.isUserOnline(user_id),
            }, groupIds);
            groups.forEach((group) => {
                const group_id = Number(group.group_id);
                presence_service_1.presenceService.leaveGroup(user_id, group_id);
                socketServer.to(`group:${group_id}`).emit("group:presence", {
                    group_id,
                    online_cnt: presence_service_1.presenceService.getOnlineCount(group_id),
                });
            });
        });
    }));
};
exports.registerSocketEvents = registerSocketEvents;
