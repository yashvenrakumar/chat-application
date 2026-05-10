import { Router } from "express";
import userRouter from "./user.routes";
import { requireUserContext } from "../middlewares/auth-context.middleware";
import groupRouter from "./group.routes";
  
const apiRouter = Router();
 
 

apiRouter.use("/users", userRouter);
apiRouter.use(requireUserContext);
apiRouter.use("/groups", groupRouter);

 

export default apiRouter;
