import { Op } from "sequelize";
import { ChatGroup, GroupUserMap, User } from "../models";
import { HttpError } from "../utils/httpError";

const LIST_MY_GROUPS_TTL_MS = 45_000;
const listMyGroupsCache = new Map<number, { expiresAt: number; groups: ChatGroup[] }>();

export class GroupService {
  /** Call when membership or visible group list changes for these users (socket join path uses listMyGroups). */
  static invalidateListMyGroupsCacheForUsers(userIds: number[]): void {
    for (const id of userIds) listMyGroupsCache.delete(id);
  }
  static async createGroup(
    admin_user_id: number,
    payload: { group_title: string; user_ids: number[] }
  ): Promise<ChatGroup> {
    const group = await ChatGroup.create({ group_title: payload.group_title, admin_user_id });
    const uniqueUserIds = [...new Set([admin_user_id, ...payload.user_ids])];

    await GroupUserMap.bulkCreate(
      uniqueUserIds.map((user_id) => ({
        group_id: group.group_id,
        user_id,
        is_admin: user_id === admin_user_id,
      }))
    );

    GroupService.invalidateListMyGroupsCacheForUsers(uniqueUserIds);
    return group;
  }

  static async updateGroup(group_id: number, auth_user_id: number, group_title: string): Promise<ChatGroup> {
    const group = await this.getGroupAsAdmin(group_id, auth_user_id);
    group.group_title = group_title;
    await group.save();
    return group;
  }

  static async addMembers(group_id: number, auth_user_id: number, user_ids: number[]): Promise<void> {
    await this.getGroupAsAdmin(group_id, auth_user_id);
    const existing = await GroupUserMap.findAll({
      where: { group_id, user_id: { [Op.in]: user_ids }, is_exited: false },
    });
    const existingIds = new Set(existing.map((item) => Number(item.user_id)));
    const missingIds = user_ids.filter((user_id) => !existingIds.has(user_id));
    if (missingIds.length === 0) return;

    await GroupUserMap.bulkCreate(missingIds.map((user_id) => ({ group_id, user_id })));
    GroupService.invalidateListMyGroupsCacheForUsers([auth_user_id, ...missingIds]);
  }

  static async removeMember(group_id: number, auth_user_id: number, user_id: number): Promise<void> {
    await this.getGroupAsAdmin(group_id, auth_user_id);
    if (auth_user_id === user_id) throw new HttpError(400, "Admin cannot remove self");
    const mapping = await GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
    if (!mapping) throw new HttpError(404, "Group member not found");

    mapping.is_exited = true;
    mapping.exited_at = new Date();
    await mapping.save();
    GroupService.invalidateListMyGroupsCacheForUsers([user_id]);
  }

  static async changeGroupAdmin(group_id: number, auth_user_id: number, user_id: number): Promise<ChatGroup> {
    const group = await this.getGroupAsAdmin(group_id, auth_user_id);
    const newAdminMember = await GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
    if (!newAdminMember) throw new HttpError(404, "New admin must be an active group member");

    const oldAdminMember = await GroupUserMap.findOne({
      where: { group_id, user_id: auth_user_id, is_exited: false },
    });
    if (oldAdminMember) {
      oldAdminMember.is_admin = false;
      await oldAdminMember.save();
    }

    newAdminMember.is_admin = true;
    await newAdminMember.save();

    group.admin_user_id = user_id;
    await group.save();
    GroupService.invalidateListMyGroupsCacheForUsers([auth_user_id, user_id]);
    return group;
  }

  static async listMyGroups(auth_user_id: number): Promise<ChatGroup[]> {
    const now = Date.now();
    const cached = listMyGroupsCache.get(auth_user_id);
    if (cached && cached.expiresAt > now) return cached.groups;

    const mappings = await GroupUserMap.findAll({
      where: { user_id: auth_user_id, is_exited: false },
      attributes: ["group_id"],
    });
    const groupIds = mappings.map((item) => Number(item.group_id));
    const groups =
      groupIds.length === 0
        ? []
        : await ChatGroup.findAll({ where: { group_id: { [Op.in]: groupIds }, is_active: true } });
    listMyGroupsCache.set(auth_user_id, { expiresAt: now + LIST_MY_GROUPS_TTL_MS, groups });
    return groups;
  }

  static async listGroupMembers(group_id: number): Promise<User[]> {
    const mappings = await GroupUserMap.findAll({
      where: { group_id, is_exited: false },
      attributes: ["user_id"],
    });
    const userIds = mappings.map((item) => Number(item.user_id));
    if (userIds.length === 0) return [];
    return User.findAll({ where: { user_id: { [Op.in]: userIds }, is_active: true } });
  }

  static async ensureMembership(group_id: number, user_id: number): Promise<void> {
    const member = await GroupUserMap.findOne({ where: { group_id, user_id, is_exited: false } });
    if (!member) throw new HttpError(403, "User is not a group member");
  }

  static async getGroupAsAdmin(group_id: number, auth_user_id: number): Promise<ChatGroup> {
    const group = await ChatGroup.findOne({ where: { group_id, is_active: true } });
    if (!group) throw new HttpError(404, "Group not found");
    if (Number(group.admin_user_id) !== auth_user_id) throw new HttpError(403, "Only group admin can perform this action");
    return group;
  }
}
