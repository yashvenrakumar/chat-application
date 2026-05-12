import webpush from "web-push";
import { env } from "../config/env";
import { PushSubscription } from "../models";
import { PushSubscriptionService } from "./push-subscription.service";

let vapidConfigured = false;

const ensureVapidConfigured = (): boolean => {
  const { vapidPublicKey, vapidPrivateKey, vapidSubject } = env.webPush;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return false;
  if (!vapidConfigured) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    vapidConfigured = true;
  }
  return true;
};

export type WebPushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

const isGoneStatus = (statusCode?: number): boolean =>
  statusCode === 404 || statusCode === 410;

export class WebPushService {
  static isConfigured(): boolean {
    return Boolean(
      env.webPush.vapidPublicKey &&
        env.webPush.vapidPrivateKey &&
        env.webPush.vapidSubject,
    );
  }

  static getPublicKey(): string | null {
    return env.webPush.vapidPublicKey || null;
  }

  /**
   * Sends a Web Push to every stored subscription for the user. Invalid subscriptions are removed.
   */
  static async sendToUser(user_id: number, payload: WebPushPayload): Promise<void> {
    if (!ensureVapidConfigured()) return;

    const subs = await PushSubscriptionService.listForUser(user_id);
    if (subs.length === 0) return;

    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    });

    await Promise.all(
      subs.map(async (sub) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };
        try {
          await webpush.sendNotification(subscription, body, {
            TTL: 60 * 60 * 12,
            urgency: "normal",
          });
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === "object" && "statusCode" in err
              ? Number((err as { statusCode?: number }).statusCode)
              : undefined;
          if (isGoneStatus(statusCode)) {
            await PushSubscription.destroy({ where: { push_subscription_id: sub.push_subscription_id } });
          } else {
            console.error("Web push send failed:", err);
          }
        }
      }),
    );
  }
}
