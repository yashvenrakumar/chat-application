"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.sendMessageSchema = joi_1.default.object({
    message_text: joi_1.default.string().min(1).max(2000).required(),
});
