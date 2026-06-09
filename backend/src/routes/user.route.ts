import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const userRouter = Router();
const userController = new UserController();

// Public routes
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);

// Protected routes (authenticated user)
userRouter.get("/profile", authorizedMiddleware, userController.getProfile);

// Admin only routes
userRouter.get("/", authorizedMiddleware, adminMiddleware, userController.getAllUsers);
userRouter.delete("/:id", authorizedMiddleware, adminMiddleware, userController.deleteUser);

export default userRouter;
