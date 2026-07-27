import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { CartController } from "../controllers/cart.controller";
const router = Router(); const controller = new CartController(); router.use(authorizedMiddleware);
router.get("/", controller.get.bind(controller)); router.put("/items", controller.upsert.bind(controller)); router.delete("/items/:productId", controller.remove.bind(controller)); router.delete("/", controller.clear.bind(controller)); export default router;
