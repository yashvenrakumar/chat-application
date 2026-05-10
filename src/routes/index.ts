import { Router } from "express";
import userRouter from "./user.routes";
import { requireUserContext } from "../middlewares/auth-context.middleware";
import groupRouter from "./group.routes";
import chatRouter from "./chat.routes";
import notificationRouter from "./notification.routes";
  
const apiRouter = Router();
 
 

apiRouter.use("/users", userRouter);
apiRouter.use(requireUserContext);
apiRouter.use("/groups", groupRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/notifications", notificationRouter);


 

export default apiRouter;
