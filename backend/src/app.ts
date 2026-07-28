import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import path from "path";
import fs from "fs";
// import morgan from "morgan";

// Routes
import userRoutes from "./routes/user.route";
import productRoutes from "./routes/product.route";
import adminUserRoutes from "./routes/admin-user.route";
import orderRoutes from "./routes/order.route";
import communicationRoutes from "./routes/communication.route";
import paymentRoutes from "./routes/payment.route";
import cartRoutes from "./routes/cart.route";
import addressRoutes from "./routes/address.route";
import notificationRoutes from "./routes/notification.route";
import aiInventoryRoutes from "./routes/ai-inventory.route";

const app: Application = express();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const profileUploadsDir = path.join(uploadsDir, "profile");
if (!fs.existsSync(profileUploadsDir)) {
    fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// FIXED — allows your phone and any device:
const corsOptions = {
    origin: (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(value => value.trim()),
    credentials: true,
    successStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));
// app.use(morgan("combined"));

// API routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/comms", communicationRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai", aiInventoryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    return res.status(404).json({ message: "API not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);
    if (err instanceof HttpException) {
        return ApiResponseHelper.error(res, err.message, err.status);
    }
    return ApiResponseHelper.error(res, err?.message || "Internal Server Error", 500);
});

export default app;
