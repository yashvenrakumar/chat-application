import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { UserService } from "../services/user.service";

const parsePageQuery = (raw: unknown): number => {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const parseLimitQuery = (raw: unknown, fallback: number): number => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
};

export class UserController {
  static async create(req: Request, res: Response): Promise<void> {
    const body = req.validated as {
      first_name: string;
      last_name: string;
      email_id: string;
     };
    const user = await UserService.createUser({ ...body });
    res.status(201).json(successResponse("User created successfully", user));
  }

  static async getAll(_req: Request, res: Response): Promise<void> {
    const users = await UserService.listUsers();
    res.status(200).json(successResponse("Users fetched successfully", users));
  }

  /** Paginated users for direct messaging (excludes current user). Query: `page`, `limit` (default 10, max 50). */
  static async listDirectory(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const page = parsePageQuery(req.query.page);
    const limit = Math.min(parseLimitQuery(req.query.limit, 10), 50);
    const data = await UserService.listUsersDirectory({
      exclude_user_id: auth_user_id,
      page,
      limit,
    });
    res.status(200).json(successResponse("User directory fetched successfully", data));
  }
}
