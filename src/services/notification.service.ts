import { Notification } from "../models";
import { HttpError } from "../utils/httpError";
export type NotificationListStatus = "all" | "read" | "unread";

export class NotificationService {
  static async createNotification(payload: {
    user_id: number;
    ntf_type: "group" | "direct" | "system";
    ntf_title: string;
    ntf_body: string;
    group_id?: number | null;
    related_user_id?: number | null;
  }): Promise<Notification> {
    return Notification.create({
      ...payload,
      group_id: payload.group_id ?? null,
      related_user_id: payload.related_user_id ?? null,
    });
  }

  static async listNotificationsPaginated(
    user_id: number,
    page: number,
    limit: number,
    status: NotificationListStatus = "all"
  ): Promise<{
    items: Notification[];
    total: number;
    unread_count: number;
    page: number;
    limit: number;
    total_pages: number;
    status: NotificationListStatus;
  }> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const where =
      status === "read"
        ? { user_id, is_read: true }
        : status === "unread"
          ? { user_id, is_read: false }
          : { user_id };

    const [items, total, unread_count] = await Promise.all([
      Notification.findAll({
        where,
        order: [["created_at", "DESC"]],
        limit: safeLimit,
        offset,
      }),
      Notification.count({ where }),
      Notification.count({ where: { user_id, is_read: false } }),
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
  }

  static async markRead(ntf_id: number, user_id: number): Promise<Notification> {
    const notification = await Notification.findOne({ where: { ntf_id, user_id } });
    if (!notification) throw new HttpError(404, "Notification not found");
    notification.is_read = true;
    await notification.save();
    return notification;
  }
}
