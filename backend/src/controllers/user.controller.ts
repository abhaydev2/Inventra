import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";

const userService = new UserService();

export class UserController {
    async register(req: Request, res: Response) {
        try {
            const parsed = CreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await userService.createUser(parsed.data);
            return ApiResponseHelper.success(res, user, "User registered successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsed = LoginUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const { user, token } = await userService.loginUser(parsed.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsed = z.object({ email: z.string().email("Invalid email address") }).safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const result = await userService.requestPasswordReset(parsed.data.email);
            return ApiResponseHelper.success(res, result, result.message);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsed = z.object({
                token: z.string().min(1, "Reset token is required"),
                password: z.string().min(6, "Password must be at least 6 characters long")
            }).safeParse(req.body);

            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }

            const updatedUser = await userService.resetPassword(parsed.data.token, parsed.data.password);
            return ApiResponseHelper.success(res, updatedUser, "Password reset successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            return ApiResponseHelper.success(res, req.user, "Profile fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", 500);
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User details fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "Unauthorized: user not found", 401);
            }
            const userId = req.user._id.toString();
            const userData = UpdateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(userData.error), 400);
            }

            if (req.file) {
                userData.data.profileImage = `/uploads/profile/${req.file.filename}`;
                
                const oldImage = (req.user as any).profileImage;
                if (oldImage) {
                    const normalizedImage = oldImage.startsWith('/') ? oldImage.slice(1) : oldImage;
                    const oldPath = require("path").join(process.cwd(), normalizedImage);
                    if (require("fs").existsSync(oldPath)) {
                        require("fs").unlinkSync(oldPath);
                    }
                }
            } else if (req.body.profileImage === null || req.body.profileImage === 'null') {
                userData.data.profileImage = null;
                const oldImage = (req.user as any).profileImage;
                if (oldImage) {
                    const normalizedImage = oldImage.startsWith('/') ? oldImage.slice(1) : oldImage;
                    const oldPath = require("path").join(process.cwd(), normalizedImage);
                    if (require("fs").existsSync(oldPath)) {
                        require("fs").unlinkSync(oldPath);
                    }
                }
            }

            if (userData.data.password) {
                const { currentPassword } = req.body;
                if (!currentPassword) {
                    return ApiResponseHelper.error(res, "Current password is required to change password", 400);
                }
                const isPasswordValid = await require("bcryptjs").compare(currentPassword, req.user.password);
                if (!isPasswordValid) {
                    return ApiResponseHelper.error(res, "Invalid current password", 400);
                }
            }

            const updatedUser = await userService.updateUser(userId, userData.data);
            return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async uploadProfileImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return ApiResponseHelper.error(res, "No file uploaded", 400);
            }
            if (!req.user) {
                return ApiResponseHelper.error(res, "Unauthorized: user not found", 401);
            }
            
            const relativePath = `/uploads/profile/${req.file.filename}`;
            
            // Delete old file if exists
            const oldImage = (req.user as any).profileImage;
            if (oldImage) {
                const normalizedImage = oldImage.startsWith('/') ? oldImage.slice(1) : oldImage;
                const oldPath = require("path").join(process.cwd(), normalizedImage);
                if (require("fs").existsSync(oldPath)) {
                    require("fs").unlinkSync(oldPath);
                }
            }

            const updatedUser = await userService.updateProfileImage(req.user._id.toString(), relativePath);
            return ApiResponseHelper.success(res, updatedUser, "Profile image uploaded successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", 500);
        }
    }

    async deleteProfileImage(req: Request, res: Response) {
        try {
            if (!req.user) {
                return ApiResponseHelper.error(res, "Unauthorized: user not found", 401);
            }
            
            const oldImage = (req.user as any).profileImage;
            if (oldImage) {
                const normalizedImage = oldImage.startsWith('/') ? oldImage.slice(1) : oldImage;
                const oldPath = require("path").join(process.cwd(), normalizedImage);
                if (require("fs").existsSync(oldPath)) {
                    require("fs").unlinkSync(oldPath);
                }
            }

            const updatedUser = await userService.updateProfileImage(req.user._id.toString(), null);
            return ApiResponseHelper.success(res, updatedUser, "Profile image removed successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", 500);
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUsers();
            return ApiResponseHelper.success(res, users, "Users fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await userService.deleteUser(id);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
