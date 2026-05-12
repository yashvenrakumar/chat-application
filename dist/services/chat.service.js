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
exports.ChatService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const httpError_1 = require("../utils/httpError");
const group_service_1 = require("./group.service");
class ChatService {
    static sendGroupMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield group_service_1.GroupService.ensureMembership(payload.group_id, payload.sender_user_id);
            return models_1.ChatMessage.create(payload);
        });
    }
    static getGroupMessages(group_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield group_service_1.GroupService.ensureMembership(group_id, user_id);
            return models_1.ChatMessage.findAll({
                where: { group_id },
                order: [["sent_at", "ASC"]],
                limit: 500,
            });
        });
    }
    static sendDirectMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.ChatMessage.create(payload);
        });
    }
    static getDirectMessages(auth_user_id, peer_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.ChatMessage.findAll({
                where: {
                    group_id: null,
                    [sequelize_1.Op.or]: [
                        { sender_user_id: auth_user_id, receiver_user_id: peer_user_id },
                        { sender_user_id: peer_user_id, receiver_user_id: auth_user_id },
                    ],
                },
                order: [["sent_at", "ASC"]],
                limit: 500,
            });
        });
    }
    static markSeen(message_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield models_1.ChatMessage.findByPk(message_id);
            if (!message)
                throw new httpError_1.HttpError(404, "Message not found");
            const [seen] = yield models_1.MessageSeen.findOrCreate({
                where: { message_id, user_id },
                defaults: { message_id, user_id },
            });
            return seen;
        });
    }
    static getMessageSeenUsers(message_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.MessageSeen.findAll({ where: { message_id } });
        });
    }
    static listGroupMemberIds(group_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const members = yield models_1.GroupUserMap.findAll({
                where: { group_id, is_exited: false },
                attributes: ["user_id"],
            });
            return members.map((member) => Number(member.user_id));
        });
    }
}
exports.ChatService = ChatService;
