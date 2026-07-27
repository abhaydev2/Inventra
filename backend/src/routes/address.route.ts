import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { AddressController } from "../controllers/address.controller";
const router = Router(); const controller = new AddressController(); router.use(authorizedMiddleware); router.get("/", controller.list.bind(controller)); router.post("/", controller.create.bind(controller)); export default router;
