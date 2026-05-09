import { Op } from "sequelize";
import { User, UserCreationAttributes } from "../models/user.model";
import { presenceService } from "./presence.service";
 
export type DirectoryUserRow = {
  user_id: number;
  first_name: string;
  last_name: string;
  email_id: string;
  is_active: boolean;
  is_online: boolean;
};

export class UserService {
  static async createUser(payload: UserCreationAttributes): Promise<User> {
    const user = await User.create(payload);
    return user;
  }

  static async listUsers(): Promise<User[]> {
    return User.findAll({
      order: [["user_id", "DESC"]],
    });
  }

  static async listUsersDirectory(params: {
    exclude_user_id: number;
    page: number;
    limit: number;
  }): Promise<{
    items: DirectoryUserRow[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    const { exclude_user_id, page, limit } = params;
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await User.findAndCountAll({
      where: { user_id: { [Op.ne]: exclude_user_id } },
      order: [["user_id", "DESC"]],
      limit: safeLimit,
      offset,
    });

    const items: DirectoryUserRow[] = rows.map((u) => {
      const raw = u.get({ plain: true });
      return {
        user_id: raw.user_id,
        first_name: raw.first_name,
        last_name: raw.last_name,
        email_id: raw.email_id,
        is_active: raw.is_active,
        is_online: presenceService.isUserOnline(raw.user_id),
      };
    });

    const total = count;
    const total_pages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      total_pages,
    };
  }
}
