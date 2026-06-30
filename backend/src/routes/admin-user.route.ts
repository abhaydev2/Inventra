import { AdminUserController } from "../controllers/admin-user.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

// Globally enforce authentication and admin check on all users admin paths
adminUserRouter.use(authorizedMiddleware);
adminUserRouter.use(adminMiddleware);

adminUserRouter.get("/", adminUserController.getUsers);
adminUserRouter.get("/:id", adminUserController.getUserById);
adminUserRouter.post("/", adminUserController.createUser);
adminUserRouter.put("/:id", adminUserController.updateUser);
adminUserRouter.delete("/:id", adminUserController.deleteUser);

export default adminUserRouter;
