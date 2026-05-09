import { Op } from "sequelize";
import { User, UserCreationAttributes } from "../models/user.model";
import { presenceService } from "./presence.service";
 
export type DirectoryUserRow = {
  usr_id: number;
  fst_nm: string;
  lst_nm: string;
  email_id: string;
  mob_no: string | null;
  is_actv: boolean;
  is_online: boolean;
};

export class UserService {
  static async createUser(payload: UserCreationAttributes): Promise<User> {
    const user = await User.create(payload);
    return user;
  }

  static async listUsers(): Promise<User[]> {
    return User.findAll({
      order: [["usr_id", "DESC"]],
    });
  }

  static async listUsersDirectory(params: {
    exclude_usr_id: number;
    page: number;
    limit: number;
  }): Promise<{
    items: DirectoryUserRow[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    const { exclude_usr_id, page, limit } = params;
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await User.findAndCountAll({
      where: { usr_id: { [Op.ne]: exclude_usr_id } },
      order: [["usr_id", "DESC"]],
      limit: safeLimit,
      offset,
    });

    const items: DirectoryUserRow[] = rows.map((u) => {
      const raw = u.get({ plain: true });
      return {
        usr_id: raw.usr_id,
        fst_nm: raw.fst_nm,
        lst_nm: raw.lst_nm,
        email_id: raw.email_id,
        mob_no: raw.mob_no ?? null,
        is_actv: raw.is_actv,
        is_online: presenceService.isUserOnline(raw.usr_id),
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
