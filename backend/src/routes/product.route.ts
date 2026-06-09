import { ProductController } from "../controllers/product.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const productRouter = Router();
const productController = new ProductController();

// All product routes require authentication
productRouter.use(authorizedMiddleware);

// Dashboard stats
productRouter.get("/dashboard", productController.getDashboardStats);

// Low stock products
productRouter.get("/low-stock", productController.getLowStockProducts);

// CRUD
productRouter.post("/", productController.createProduct);
productRouter.get("/", productController.getAllProducts);
productRouter.get("/:id", productController.getProduct);
productRouter.put("/:id", productController.updateProduct);
productRouter.delete("/:id", adminMiddleware, productController.deleteProduct);

export default productRouter;
