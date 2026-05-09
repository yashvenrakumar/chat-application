import { Router } from "express";
import { sequelize } from "../config/database";
import userRouter from "./user.routes";
  
const apiRouter = Router();
 
 

apiRouter.use("/users", userRouter);
 

export default apiRouter;
