import { Router } from "express";
import { createUserSchema } from "../validators/user.validator";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middlewares/validate.middleware";
import { requireUserContext } from "../middlewares/auth-context.middleware";

const userRouter = Router();

userRouter.post(
  "/",
  validateBody(createUserSchema),
  asyncHandler(UserController.create),
);
userRouter.get("/", asyncHandler(UserController.getAll));
userRouter.get(
  "/directory",
  requireUserContext,
  asyncHandler(UserController.listDirectory),
);

export default userRouter;
