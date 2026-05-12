"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushUnsubscribeBodySchema = exports.pushSubscribeBodySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.pushSubscribeBodySchema = joi_1.default.object({
    endpoint: joi_1.default.string().uri().required(),
    keys: joi_1.default.object({
        p256dh: joi_1.default.string().required(),
        auth: joi_1.default.string().required(),
    })
        .required()
        .unknown(true),
    expirationTime: joi_1.default.number().allow(null).optional(),
}).unknown(true);
exports.pushUnsubscribeBodySchema = joi_1.default.object({
    endpoint: joi_1.default.string().uri().optional(),
}).unknown(true);
