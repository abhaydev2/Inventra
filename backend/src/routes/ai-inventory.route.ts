import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import { AIInventoryController } from "../controllers/ai-inventory.controller";

const destination = path.join(process.cwd(), "uploads", "ai-analysis");
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      if (!fs.existsSync(destination)) fs.mkdirSync(destination, { recursive: true });
      callback(null, destination);
    },
    filename: (_req, file, callback) => callback(null, `ai-analysis-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  }),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype))
});
const router = Router();
const controller = new AIInventoryController();

router.use(authorizedMiddleware);
router.get("/inventory/overview", controller.overview.bind(controller));
router.get("/inventory/alerts", controller.alerts.bind(controller));
router.get("/inventory/forecast", controller.forecast.bind(controller));
router.get("/inventory/products/:productId", controller.product.bind(controller));
router.post("/inventory/analyze", adminMiddleware, controller.analyze.bind(controller));
router.post("/inventory/question", controller.question.bind(controller));
router.get("/inventory/image-analysis", controller.imageHistory.bind(controller));
router.post("/inventory/image-analysis", upload.single("image"), controller.image.bind(controller));

export default router;
