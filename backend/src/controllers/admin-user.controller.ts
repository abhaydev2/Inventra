import { Request, Response } from "express";
import { AdminUserService } from "../services/admin-user.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin-user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";

const adminUserService = new AdminUserService();

export class AdminUserController {
    async getUsers(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search ? String(req.query.search) : undefined;

            const result = await adminUserService.getUsers(page, limit, search);
            return ApiResponseHelper.success(
                res, 
                result.users, 
                "Users fetched successfully", 
                200, 
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res, 
                error.message || "Internal Server Error", 
                error.status || 500
            );
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await adminUserService.getUserById(id);
            return ApiResponseHelper.success(res, user, "User details fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res, 
                error.message || "Internal Server Error", 
                error.status || 500
            );
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const parsedData = AdminCreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
            }

            const newUser = await adminUserService.createUser(parsedData.data);
            return ApiResponseHelper.success(res, newUser, "User created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res, 
                error.message || "Internal Server Error", 
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
            }

            const updatedUser = await adminUserService.updateUser(id, parsedData.data);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res, 
                error.message || "Internal Server Error", 
                error.status || 500
            );
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const callerId = (req.user as any)._id.toString();

            await adminUserService.deleteUser(id, callerId);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res, 
                error.message || "Internal Server Error", 
                error.status || 500
            );
        }
    }
}
