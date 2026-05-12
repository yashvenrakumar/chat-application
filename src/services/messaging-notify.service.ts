import type { ChatMessage } from "../models";
import { presenceService } from "./presence.service";
import { NotificationService } from "./notification.service";
import { WebPushService } from "./web-push.service";
import { ChatService } from "./chat.service";

/**
 * When the recipient has an active Socket.IO connection we rely on real-time delivery only.
 * Otherwise we persist an in-app notification and attempt Web Push (if VAPID and subscriptions exist).
 */
export class MessagingNotifyService {
  private static async deliverOfflineOnly(payload: {
    user_id: number;
    ntf_type: "group" | "direct";
    ntf_title: string;
    ntf_body: string;
    group_id?: number | null;
    related_user_id?: number | null;
    pushData?: Record<string, string>;
  }): Promise<void> {
    if (presenceService.isUserOnline(payload.user_id)) return;

    await NotificationService.createNotification({
      user_id: payload.user_id,
      ntf_type: payload.ntf_type,
      ntf_title: payload.ntf_title,
      ntf_body: payload.ntf_body,
      group_id: payload.group_id ?? null,
      related_user_id: payload.related_user_id ?? null,
    });

    if (!WebPushService.isConfigured()) return;

    await WebPushService.sendToUser(payload.user_id, {
      title: payload.ntf_title,
      body: payload.ntf_body,
      data: payload.pushData,
    });
  }

  static async afterGroupMessage(message: ChatMessage, sender_user_id: number): Promise<void> {
    const group_id = message.group_id;
    if (group_id == null) return;

    const memberIds = await ChatService.listGroupMemberIds(group_id);
    const recipients = memberIds.filter((id) => id !== sender_user_id);
    const bodyPreview = message.message_text.slice(0, 120);

    await Promise.all(
      recipients.map((user_id) =>
        this.deliverOfflineOnly({
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
        }),
      ),
    );
  }

  static async afterDirectMessage(message: ChatMessage): Promise<void> {
    const receiver_user_id = message.receiver_user_id;
    const sender_user_id = message.sender_user_id;
    if (receiver_user_id == null) return;

    const bodyPreview = message.message_text.slice(0, 120);
    await this.deliverOfflineOnly({
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
  }
}
