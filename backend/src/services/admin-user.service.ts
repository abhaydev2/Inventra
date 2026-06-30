import { UserMongoRepository } from "../repositories/user.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin-user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";

const userRepository = new UserMongoRepository();

export class AdminUserService {
    async getUsers(page: number, limit: number, search?: string) {
        const { users, total } = await userRepository.getPaginatedUsers(page, limit, search);
        const totalPages = Math.ceil(total / limit);
        return {
            users,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    async createUser(userData: AdminCreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }

        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        const user = await userRepository.createUser({
            ...userData,
            password: hashedPassword
        });
        
        // Remove password from returned object
        const userObj = user.toObject();
        delete (userObj as any).password;
        return userObj as IUser;
    }

    async updateUser(id: string, userData: AdminUpdateUserDTO): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }

        if (userData.email && userData.email !== existingUser.email) {
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }

        if (userData.username && userData.username !== existingUser.username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }

        const updateData: Partial<IUser> = { ...userData };
        if (userData.password) {
            updateData.password = await bcryptjs.hash(userData.password, 10);
        }

        const updatedUser = await userRepository.update(id, updateData);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user");
        }
        return updatedUser;
    }

    async deleteUser(id: string, callerId: string): Promise<boolean> {
        if (id === callerId) {
            throw new HttpException(400, "Admins are not allowed to delete their own accounts");
        }
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return await userRepository.delete(id);
    }
}
