import { PushSubscription } from "../models";

export type BrowserPushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};

export class PushSubscriptionService {
  static async upsertForUser(
    user_id: number,
    input: BrowserPushSubscriptionInput,
  ): Promise<PushSubscription> {
    const existing = await PushSubscription.findOne({
      where: { endpoint: input.endpoint },
    });
    if (existing) {
      existing.user_id = user_id;
      existing.keys_p256dh = input.keys.p256dh;
      existing.keys_auth = input.keys.auth;
      await existing.save();
      return existing;
    }
    return PushSubscription.create({
      user_id,
      endpoint: input.endpoint,
      keys_p256dh: input.keys.p256dh,
      keys_auth: input.keys.auth,
    });
  }

  static async removeByEndpoint(user_id: number, endpoint: string): Promise<number> {
    return PushSubscription.destroy({ where: { user_id, endpoint } });
  }

  static async removeAllForUser(user_id: number): Promise<number> {
    return PushSubscription.destroy({ where: { user_id } });
  }

  static async listForUser(user_id: number): Promise<PushSubscription[]> {
    return PushSubscription.findAll({ where: { user_id } });
  }
}
