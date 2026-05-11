import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { NotificationController } from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.get("/", asyncHandler(NotificationController.list));
notificationRouter.post(
  "/:ntf_id/read",
  asyncHandler(NotificationController.markRead),
);

export default notificationRouter;
