import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { PaymentController } from "../controllers/payment.controller";
const router = Router(); const controller = new PaymentController();
router.post("/esewa/initiate", authorizedMiddleware, controller.initiateEsewa.bind(controller));
export default router;
