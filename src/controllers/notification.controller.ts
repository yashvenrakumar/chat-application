import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { NotificationService, type NotificationListStatus } from "../services/notification.service";

const parsePageQuery = (raw: unknown): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const parseLimitQuery = (raw: unknown, fallback: number): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
};

const parseNotificationStatus = (raw: unknown): NotificationListStatus => {
  if (raw === "read" || raw === "unread") return raw;
  return "all";
};

export class NotificationController {
  static async list(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const page = parsePageQuery(req.query.page);
    const limit = Math.min(parseLimitQuery(req.query.limit, 10), 50);
    const status = parseNotificationStatus(req.query.status);
    const data = await NotificationService.listNotificationsPaginated(auth_user_id, page, limit, status);
    res.status(200).json(successResponse("Notifications fetched successfully", data));
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const notification_id = Number(req.params.notification_id);
    const notification = await NotificationService.markRead(notification_id, auth_user_id);
    res.status(200).json(successResponse("Notification marked as read", notification));
  }
}
