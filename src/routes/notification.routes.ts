import { NextFunction, Request, Response, Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { NotificationController } from "../controllers/notification.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { pushSubscribeBodySchema, pushUnsubscribeBodySchema } from "../validators/push-subscription.validator";

const ensureJsonObjectBody = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body == null || typeof req.body !== "object") req.body = {};
  next();
};

const notificationRouter = Router();

notificationRouter.post(
  "/push/subscribe",
  validateBody(pushSubscribeBodySchema),
  asyncHandler(NotificationController.pushSubscribe),
);
notificationRouter.delete(
  "/push/subscribe",
  ensureJsonObjectBody,
  validateBody(pushUnsubscribeBodySchema),
  asyncHandler(NotificationController.pushUnsubscribe),
);
notificationRouter.get("/", asyncHandler(NotificationController.list));
notificationRouter.post(
  "/:ntf_id/read",
  asyncHandler(NotificationController.markRead),
);

export default notificationRouter;
