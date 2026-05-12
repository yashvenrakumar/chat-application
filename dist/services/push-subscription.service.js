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
exports.PushSubscriptionService = void 0;
const models_1 = require("../models");
class PushSubscriptionService {
    static upsertForUser(user_id, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield models_1.PushSubscription.findOne({
                where: { endpoint: input.endpoint },
            });
            if (existing) {
                existing.user_id = user_id;
                existing.keys_p256dh = input.keys.p256dh;
                existing.keys_auth = input.keys.auth;
                yield existing.save();
                return existing;
            }
            return models_1.PushSubscription.create({
                user_id,
                endpoint: input.endpoint,
                keys_p256dh: input.keys.p256dh,
                keys_auth: input.keys.auth,
            });
        });
    }
    static removeByEndpoint(user_id, endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.PushSubscription.destroy({ where: { user_id, endpoint } });
        });
    }
    static removeAllForUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.PushSubscription.destroy({ where: { user_id } });
        });
    }
    static listForUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return models_1.PushSubscription.findAll({ where: { user_id } });
        });
    }
}
exports.PushSubscriptionService = PushSubscriptionService;
