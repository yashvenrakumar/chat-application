import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { io } from "../socket/io";
import { GroupService } from "../services/group.service";
import { presenceService } from "../services/presence.service";
import { ChatService } from "../services/chat.service";
import { NotificationService } from "../services/notification.service";

export class ChatController {
  static async sendGroupMessage(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const payload = req.validated as { message_text: string };
    const message = await ChatService.sendGroupMessage({
      group_id,
      sender_user_id: auth_user_id,
      message_text: payload.message_text,
    });

    const memberIds = await ChatService.listGroupMemberIds(group_id);
    await Promise.all(
      memberIds
        .filter((user_id) => user_id !== auth_user_id)
        .map((user_id) =>
          NotificationService.createNotification({
            user_id,
            ntf_type: "group",
            ntf_title: "New group message",
            ntf_body: payload.message_text.slice(0, 120),
            group_id,
          }),
        ),
    );

    io.to(`group:${group_id}`).emit("group:message", message);
    res
      .status(201)
      .json(successResponse("Group message sent successfully", message));
  }

  static async getGroupMessages(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const messages = await ChatService.getGroupMessages(group_id, auth_user_id);
    res
      .status(200)
      .json(successResponse("Group messages fetched successfully", messages));
  }

  static async sendDirectMessage(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const peer_user_id = Number(req.params.peer_user_id);
    const payload = req.validated as { message_text: string };

    const message = await ChatService.sendDirectMessage({
      sender_user_id: auth_user_id,
      receiver_user_id: peer_user_id,
      message_text: payload.message_text,
    });

    await NotificationService.createNotification({
      user_id: peer_user_id,
      ntf_type: "direct",
      ntf_title: "New direct message",
      ntf_body: payload.message_text.slice(0, 120),
      related_user_id: auth_user_id,
    });

    io.to(`user:${peer_user_id}`).emit("direct:message", message);
    io.to(`user:${auth_user_id}`).emit("direct:message", message);
    res
      .status(201)
      .json(successResponse("Direct message sent successfully", message));
  }

  static async getDirectMessages(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const peer_user_id = Number(req.params.peer_user_id);
    const messages = await ChatService.getDirectMessages(
      auth_user_id,
      peer_user_id,
    );
    res
      .status(200)
      .json(successResponse("Direct messages fetched successfully", messages));
  }

  static async markSeen(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const message_id = Number(req.params.message_id);
    const seen = await ChatService.markSeen(message_id, auth_user_id);
    const seenUsers = await ChatService.getMessageSeenUsers(message_id);
    io.emit("message:seen", { message_id, seen_users: seenUsers });
    res.status(200).json(successResponse("Message marked as seen", seen));
  }

  static async groupOnline(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    await GroupService.ensureMembership(group_id, auth_user_id);
    const online = presenceService.getOnlineUsers(group_id);
    res.status(200).json(
      successResponse("Group online users fetched successfully", {
        group_id,
        online_count: online.length,
        online_user_ids: online,
      }),
    );
  }

  static async directOnline(req: Request, res: Response): Promise<void> {
    const peer_user_id = Number(req.params.peer_user_id);
    res.status(200).json(
      successResponse("Direct user online status fetched successfully", {
        user_id: peer_user_id,
        is_online: presenceService.isUserOnline(peer_user_id),
      }),
    );
  }
}
