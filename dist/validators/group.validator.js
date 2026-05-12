"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroupMembersSchema = exports.updateGroupSchema = exports.createGroupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createGroupSchema = joi_1.default.object({
    group_title: joi_1.default.string().min(2).max(120).required(),
    user_ids: joi_1.default.array().items(joi_1.default.number().integer().positive()).default([]),
});
exports.updateGroupSchema = joi_1.default.object({
    group_title: joi_1.default.string().min(2).max(120).required(),
});
exports.addGroupMembersSchema = joi_1.default.object({
    user_ids: joi_1.default.array().items(joi_1.default.number().integer().positive()).min(1).required(),
});
