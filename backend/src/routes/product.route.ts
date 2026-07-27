import { ProductController } from "../controllers/product.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const productRouter = Router();
const productController = new ProductController();
const productUploadDirectory = path.join(process.cwd(), "uploads/products");
if (!fs.existsSync(productUploadDirectory)) fs.mkdirSync(productUploadDirectory, { recursive: true });
const productUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, productUploadDirectory),
        filename: (_req, file, callback) => callback(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});

// All product routes require authentication
productRouter.use(authorizedMiddleware);

// Dashboard stats
productRouter.get("/dashboard", productController.getDashboardStats);

// Low stock products
productRouter.get("/low-stock", productController.getLowStockProducts);

// CRUD
productRouter.post("/", adminMiddleware, productController.createProduct);
productRouter.get("/", productController.getAllProducts);
productRouter.get("/:id", productController.getProduct);
productRouter.put("/:id", adminMiddleware, productController.updateProduct);
productRouter.post("/:id/image", adminMiddleware, productUpload.single("productImage"), productController.uploadProductImage.bind(productController));
productRouter.delete("/:id", adminMiddleware, productController.deleteProduct);

export default productRouter;
