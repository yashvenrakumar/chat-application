import { Router } from "express";
 import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middlewares/validate.middleware";
import { sendMessageSchema } from "../validators/chat.validator";
import { ChatController } from "../controllers/chat.controller";
 
const chatRouter = Router();

chatRouter.get("/groups/:group_id/messages", asyncHandler(ChatController.getGroupMessages));
chatRouter.post(
  "/groups/:group_id/messages",
  validateBody(sendMessageSchema),
  asyncHandler(ChatController.sendGroupMessage)
);
chatRouter.get("/groups/:group_id/online", asyncHandler(ChatController.groupOnline));
chatRouter.get("/direct/:peer_user_id/online", asyncHandler(ChatController.directOnline));
chatRouter.get("/direct/:peer_user_id/messages", asyncHandler(ChatController.getDirectMessages));
chatRouter.post(
  "/direct/:peer_user_id/messages",
  validateBody(sendMessageSchema),
  asyncHandler(ChatController.sendDirectMessage)
);
chatRouter.post("/messages/:message_id/seen", asyncHandler(ChatController.markSeen));

export default chatRouter;
