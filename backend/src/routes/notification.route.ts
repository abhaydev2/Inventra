import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { NotificationController } from "../controllers/notification.controller";
const router = Router(); const controller = new NotificationController(); router.use(authorizedMiddleware); router.get("/", controller.list.bind(controller)); router.patch("/read", controller.markAllRead.bind(controller)); export default router;
