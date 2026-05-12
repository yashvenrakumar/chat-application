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
exports.GroupService = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const httpError_1 = require("../utils/httpError");
const LIST_MY_GROUPS_TTL_MS = 45000;
const listMyGroupsCache = new Map();
class GroupService {
    /** Call when membership or visible group list changes for these users (socket join path uses listMyGroups). */
    static invalidateListMyGroupsCacheForUsers(userIds) {
        for (const id of userIds)
            listMyGroupsCache.delete(id);
    }
    static createGroup(admin_user_id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield models_1.ChatGroup.create({ group_title: payload.group_title, admin_user_id });
            const uniqueUserIds = [...new Set([admin_user_id, ...payload.user_ids])];
            yield models_1.GroupUserMap.bulkCreate(uniqueUserIds.map((user_id) => ({
                group_id: group.group_id,
                user_id,
                is_admin: user_id === admin_user_id,
            })));
            GroupService.invalidateListMyGroupsCacheForUsers(uniqueUserIds);
            return group;
        });
    }
    static updateGroup(group_id, auth_user_id, group_title) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.getGroupAsAdmin(group_id, auth_user_id);
            group.group_title = group_title;
            yield group.save();
            return group;
        });
    }
    static addMembers(group_id, auth_user_id, user_ids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getGroupAsAdmin(group_id, auth_user_id);
            const existing = yield models_1.GroupUserMap.findAll({
                where: { group_id, user_id: { [sequelize_1.Op.in]: user_ids }, is_exited: false },
            });
            const existingIds = new Set(existing.map((item) => Number(item.user_id)));
            const missingIds = user_ids.filter((user_id) => !existingIds.has(user_id));
            if (missingIds.length === 0)
                return;
            yield models_1.GroupUserMap.bulkCreate(missingIds.map((user_id) => ({ group_id, user_id })));
            GroupService.invalidateListMyGroupsCacheForUsers([auth_user_id, ...missingIds]);
        });
    }
    static removeMember(group_id, auth_user_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getGroupAsAdmin(group_id, auth_user_id);
            if (auth_user_id === user_id)
                throw new httpError_1.HttpError(400, "Admin cannot remove self");
            const mapping = yield models_1.GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
            if (!mapping)
                throw new httpError_1.HttpError(404, "Group member not found");
            mapping.is_exited = true;
            mapping.exited_at = new Date();
            yield mapping.save();
            GroupService.invalidateListMyGroupsCacheForUsers([user_id]);
        });
    }
    static changeGroupAdmin(group_id, auth_user_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield this.getGroupAsAdmin(group_id, auth_user_id);
            const newAdminMember = yield models_1.GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
            if (!newAdminMember)
                throw new httpError_1.HttpError(404, "New admin must be an active group member");
            const oldAdminMember = yield models_1.GroupUserMap.findOne({
                where: { group_id, user_id: auth_user_id, is_exited: false },
            });
            if (oldAdminMember) {
                oldAdminMember.is_admin = false;
                yield oldAdminMember.save();
            }
            newAdminMember.is_admin = true;
            yield newAdminMember.save();
            group.admin_user_id = user_id;
            yield group.save();
            GroupService.invalidateListMyGroupsCacheForUsers([auth_user_id, user_id]);
            return group;
        });
    }
    static listMyGroups(auth_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const cached = listMyGroupsCache.get(auth_user_id);
            if (cached && cached.expiresAt > now)
                return cached.groups;
            const mappings = yield models_1.GroupUserMap.findAll({
                where: { user_id: auth_user_id, is_exited: false },
                attributes: ["group_id"],
            });
            const groupIds = mappings.map((item) => Number(item.group_id));
            const groups = groupIds.length === 0
                ? []
                : yield models_1.ChatGroup.findAll({ where: { group_id: { [sequelize_1.Op.in]: groupIds }, is_active: true } });
            listMyGroupsCache.set(auth_user_id, { expiresAt: now + LIST_MY_GROUPS_TTL_MS, groups });
            return groups;
        });
    }
    static listGroupMembers(group_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const mappings = yield models_1.GroupUserMap.findAll({
                where: { group_id, is_exited: false },
                attributes: ["user_id"],
            });
            const userIds = mappings.map((item) => Number(item.user_id));
            if (userIds.length === 0)
                return [];
            return models_1.User.findAll({ where: { user_id: { [sequelize_1.Op.in]: userIds }, is_active: true } });
        });
    }
    static ensureMembership(group_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield models_1.GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
            if (!member)
                throw new httpError_1.HttpError(403, "User is not a group member");
        });
    }
    static getGroupAsAdmin(group_id, auth_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const group = yield models_1.ChatGroup.findOne({ where: { group_id, is_active: true } });
            if (!group)
                throw new httpError_1.HttpError(404, "Group not found");
            if (Number(group.admin_user_id) !== auth_user_id)
                throw new httpError_1.HttpError(403, "Only group admin can perform this action");
            return group;
        });
    }
}
exports.GroupService = GroupService;
