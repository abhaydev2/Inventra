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
    origin: "*",
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
