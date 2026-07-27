import { Router } from "express";
import { CommunicationController } from "../controllers/communication.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const commsRouter = Router();
const commsController = new CommunicationController();

commsRouter.use(authorizedMiddleware);

commsRouter.post("/calls", commsController.addCallLog);
commsRouter.get("/calls", commsController.getCallLogs);
commsRouter.post("/messages", commsController.sendMessage);
commsRouter.get("/messages", commsController.getMessages);

export default commsRouter;
