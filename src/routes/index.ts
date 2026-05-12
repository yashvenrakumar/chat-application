import { Router } from "express";
import userRouter from "./user.routes";
import { requireUserContext } from "../middlewares/auth-context.middleware";
import groupRouter from "./group.routes";
import chatRouter from "./chat.routes";
import notificationRouter from "./notification.routes";
import { asyncHandler } from "../utils/asyncHandler";
import { NotificationController } from "../controllers/notification.controller";

const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.get(
  "/notifications/push/vapid-public-key",
  asyncHandler(NotificationController.vapidPublicKey),
);
apiRouter.use(requireUserContext);
apiRouter.use("/groups", groupRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/notifications", notificationRouter);


 

export default apiRouter;
