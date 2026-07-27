import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.use(authorizedMiddleware);

orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getOrders);
orderRouter.patch("/:id", adminMiddleware, orderController.updateOrderStatus);

export default orderRouter;
