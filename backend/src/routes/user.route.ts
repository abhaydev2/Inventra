import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(process.cwd(), "uploads/profile");
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "profile-" + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const userRouter = Router();
const userController = new UserController();

// Public routes
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/verify-reset-code", userController.verifyPasswordResetCode);
userRouter.post("/reset-password", userController.resetPassword);

// Protected routes (authenticated user)
userRouter.get("/profile", authorizedMiddleware, userController.getProfile);
userRouter.post("/profile/image", authorizedMiddleware, upload.single("profileImage"), userController.uploadProfileImage);
userRouter.delete("/profile/image", authorizedMiddleware, userController.deleteProfileImage);
userRouter.get("/whoami", authorizedMiddleware, userController.whoami);
userRouter.put("/update", authorizedMiddleware, upload.single("profileImage"), userController.update);

// Admin only routes
userRouter.get("/", authorizedMiddleware, adminMiddleware, userController.getAllUsers);
userRouter.delete("/:id", authorizedMiddleware, adminMiddleware, userController.deleteUser);

export default userRouter;
