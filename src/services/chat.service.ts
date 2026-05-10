import { Op } from "sequelize";
import { ChatMessage, GroupUserMap, MessageSeen } from "../models";
import { HttpError } from "../utils/httpError";
import { GroupService } from "./group.service";

export class ChatService {
  static async sendGroupMessage(payload: {
    group_id: number;
    sender_user_id: number;
    message_text: string;
  }): Promise<ChatMessage> {
    await GroupService.ensureMembership(payload.group_id, payload.sender_user_id);
    return ChatMessage.create(payload);
  }

  static async getGroupMessages(group_id: number, user_id: number): Promise<ChatMessage[]> {
    await GroupService.ensureMembership(group_id, user_id);
    return ChatMessage.findAll({
      where: { group_id },
      order: [["sent_at", "ASC"]],
      limit: 500,
    });
  }

  static async sendDirectMessage(payload: {
    sender_user_id: number;
    receiver_user_id: number;
    message_text: string;
  }): Promise<ChatMessage> {
    return ChatMessage.create(payload);
  }

  static async getDirectMessages(auth_user_id: number, peer_user_id: number): Promise<ChatMessage[]> {
    return ChatMessage.findAll({
      where: {
        group_id: null,
        [Op.or]: [
          { sender_user_id: auth_user_id, receiver_user_id: peer_user_id },
          { sender_user_id: peer_user_id, receiver_user_id: auth_user_id },
        ],
      },
      order: [["sent_at", "ASC"]],
      limit: 500,
    });
  }

  static async markSeen(message_id: number, user_id: number): Promise<MessageSeen> {
    const message = await ChatMessage.findByPk(message_id);
    if (!message) throw new HttpError(404, "Message not found");

    const [seen] = await MessageSeen.findOrCreate({
      where: { message_id, user_id },
      defaults: { message_id, user_id },
    });
    return seen;
  }

  static async getMessageSeenUsers(message_id: number): Promise<MessageSeen[]> {
    return MessageSeen.findAll({ where: { message_id } });
  }

  static async listGroupMemberIds(group_id: number): Promise<number[]> {
    const members = await GroupUserMap.findAll({
      where: { group_id, is_exited: false },
      attributes: ["user_id"],
    });
    return members.map((member) => Number(member.user_id));
  }
}
