import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";
import { GroupService } from "../services/group.service";

export class GroupController {
  static async create(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;

    const payload = req.validated as {
      group_title: string;
      user_ids: number[];
    };
    const group = await GroupService.createGroup(auth_user_id, payload);
    res.status(201).json(successResponse("Group created successfully", group));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const payload = req.validated as { group_title: string };
    const group = await GroupService.updateGroup(
      group_id,
      auth_user_id,
      payload.group_title,
    );
    res.status(200).json(successResponse("Group updated successfully", group));
  }

  static async addMembers(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const payload = req.validated as { user_ids: number[] };
    await GroupService.addMembers(group_id, auth_user_id, payload.user_ids);
    res.status(200).json(successResponse("Members added successfully"));
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const user_id = Number(req.params.user_id);
    await GroupService.removeMember(group_id, auth_user_id, user_id);
    res.status(200).json(successResponse("Member removed successfully"));
  }

  static async myGroups(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const groups = await GroupService.listMyGroups(auth_user_id);
    res
      .status(200)
      .json(successResponse("Groups fetched successfully", groups));
  }

  static async members(req: Request, res: Response): Promise<void> {
    const group_id = Number(req.params.group_id);
    const members = await GroupService.listGroupMembers(group_id);
    res
      .status(200)
      .json(successResponse("Group members fetched successfully", members));
  }

  static async changeAdmin(req: Request, res: Response): Promise<void> {
    const auth_user_id = req.auth_user_id as number;
    const group_id = Number(req.params.group_id);
    const user_id = Number(req.params.user_id);
    const group = await GroupService.changeGroupAdmin(
      group_id,
      auth_user_id,
      user_id,
    );
    res
      .status(200)
      .json(successResponse("Group admin changed successfully", group));
  }
}
