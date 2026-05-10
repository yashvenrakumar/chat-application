import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middlewares/validate.middleware";

import { GroupController } from "../controllers/group.controller";
import {
  addGroupMembersSchema,
  createGroupSchema,
  updateGroupSchema,
} from "../validators/group.validator";

const groupRouter = Router();

groupRouter.get("/my", asyncHandler(GroupController.myGroups));

groupRouter.post(
  "/",
  validateBody(createGroupSchema),
  asyncHandler(GroupController.create),
);
groupRouter.put(
  "/:group_id",
  validateBody(updateGroupSchema),
  asyncHandler(GroupController.update),
);
groupRouter.get("/:group_id/members", asyncHandler(GroupController.members));
groupRouter.post(
  "/:group_id/members",
  validateBody(addGroupMembersSchema),
  asyncHandler(GroupController.addMembers),
);
groupRouter.delete(
  "/:group_id/members/:user_id",
  asyncHandler(GroupController.removeMember),
);
groupRouter.post(
  "/:group_id/admin/:user_id",
  asyncHandler(GroupController.changeAdmin),
);

export default groupRouter;
