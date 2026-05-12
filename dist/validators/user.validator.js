"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserSchema = joi_1.default.object({
    first_name: joi_1.default.string().min(2).max(100).required(),
    last_name: joi_1.default.string().min(1).max(100).required(),
    email_id: joi_1.default.string().email().required(),
});
