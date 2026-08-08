import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../configs/constant";
import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { UserMongoRepository } from "../repositories/user.repository";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
    }
}

const userRepository = new UserMongoRepository();

export const authorizedMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            throw new HttpException(401, "Unauthorized: missing token");

        const token = authHeader.split(" ")[1];
        if (!token) throw new HttpException(401, "Unauthorized: token missing");

        const decodedToken = jwt.verify(token, SECRET_KEY) as Record<string, any>;
        if (!decodedToken || !decodedToken.id) {
            throw new HttpException(401, "Unauthorized: invalid token");
        }

        const user = await userRepository.getUserById(decodedToken.id);
        if (!user) throw new HttpException(401, "Unauthorized: user not found");

        req.user = user;
        return next();
    } catch (err: Error | any) {
        const status =
            err instanceof jwt.JsonWebTokenError ||
            err instanceof jwt.TokenExpiredError ||
            err instanceof jwt.NotBeforeError
                ? 401
                : err.status || 500;
        return ApiResponseHelper.error(
            res,
            status === 401 ? "Your session is invalid or expired. Please log in again." : err.message || "Internal Server Error",
            status
        );
    }
};

export const adminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new HttpException(401, "Unauthorized: no user info");
        }
        if ((req.user as IUser).role !== "admin") {
            throw new HttpException(403, "Forbidden: admin access required");
        }
        return next();
    } catch (err: Error | any) {
        return ApiResponseHelper.error(
            res,
            err.message || "Internal Server Error",
            err.status || 500
        );
    }
};
