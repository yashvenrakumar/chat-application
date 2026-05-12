import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { NotificationService, type NotificationListStatus } from "../services/notification.service";
import { HttpError } from "../utils/httpError";
import { PushSubscriptionService } from "../services/push-subscription.service";
import { WebPushService } from "../services/web-push.service";
import type { BrowserPushSubscriptionInput } from "../services/push-subscription.service";

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
  /** Public: browser needs the VAPID public key before `pushManager.subscribe`. */
  static async vapidPublicKey(_req: Request, res: Response): Promise<void> {
    const publicKey = WebPushService.getPublicKey();
    if (!publicKey) {
      throw new HttpError(
        503,
        "Web Push is not configured (set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT)",
      );
    }
    res.status(200).json(successResponse("VAPID public key", { publicKey }));
  }

  static async pushSubscribe(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const body = req.validated as BrowserPushSubscriptionInput;
    const row = await PushSubscriptionService.upsertForUser(auth_user_id, body);
    res.status(200).json(successResponse("Push subscription saved", { push_subscription_id: row.push_subscription_id }));
  }

  static async pushUnsubscribe(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const body = req.validated as { endpoint?: string };
    if (body.endpoint) {
      const removed = await PushSubscriptionService.removeByEndpoint(auth_user_id, body.endpoint);
      res.status(200).json(successResponse("Push subscription removed", { removed }));
      return;
    }
    const removed = await PushSubscriptionService.removeAllForUser(auth_user_id);
    res.status(200).json(successResponse("All push subscriptions removed", { removed }));
  }

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
    const ntf_id = Number(req.params.ntf_id);
    const notification = await NotificationService.markRead(ntf_id, auth_user_id);
    res.status(200).json(successResponse("Notification marked as read", notification));
  }
}
