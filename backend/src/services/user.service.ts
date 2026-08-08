import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { SECRET_KEY } from "../configs/constant";
import { sendPasswordResetEmail } from "../utils/email.util";

const userRepository = new UserMongoRepository();

export class UserService {
    constructor(
        private readonly passwordResetEmailSender = sendPasswordResetEmail
    ) {}

    async createUser(userData: CreateUserDTO): Promise<IUser> {
        userData.email = userData.email.trim().toLowerCase();
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;
        const user = await userRepository.createUser(userData);
        return user;
    }

    async loginUser(loginData: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(loginData.email.trim());
        if (!user) {
            throw new HttpException(400, "Email not registered. Please register first.");
        }
        const isPasswordValid = await bcryptjs.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid email or password");
        }
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        const userWithoutPassword = { ...user.toObject(), password: undefined };
        return { user: userWithoutPassword, token };
    }

    async requestPasswordReset(email: string): Promise<{
        message: string;
        delivery: "email";
    }> {
        const user = await userRepository.getUserByEmail(email.trim().toLowerCase());
        if (!user) {
            throw new HttpException(404, "Email not registered");
        }

        const verificationCode = crypto.randomInt(100000, 1000000).toString();
        const codeHash = await bcryptjs.hash(verificationCode, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await userRepository.update(user._id.toString(), {
            passwordResetToken: codeHash,
            passwordResetExpiresAt: expiresAt
        } as any);

        const delivery = await this.passwordResetEmailSender(
            user.email,
            verificationCode,
            user.firstName
        );
        if (!delivery.sent) {
            throw new HttpException(
                503,
                "Unable to send the verification email. Check SMTP_USER and SMTP_PASS."
            );
        }

        return {
            message: "Verification code sent to your email",
            delivery: "email"
        };
    }

    async verifyPasswordResetCode(email: string, code: string): Promise<{ resetToken: string }> {
        const user = await userRepository.getUserByEmail(email.trim().toLowerCase());
        if (!user || !user.passwordResetToken || !user.passwordResetExpiresAt) {
            throw new HttpException(400, "Invalid or expired verification code");
        }
        if (user.passwordResetExpiresAt < new Date()) {
            throw new HttpException(400, "Verification code has expired");
        }

        const validCode = await bcryptjs.compare(code, user.passwordResetToken);
        if (!validCode) {
            throw new HttpException(400, "Invalid verification code");
        }

        const resetToken = jwt.sign(
            { sub: user._id.toString(), purpose: "password-reset" },
            SECRET_KEY,
            { expiresIn: "15m" }
        );
        await userRepository.update(user._id.toString(), {
            passwordResetToken: resetToken,
            passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000)
        } as any);
        return { resetToken };
    }

    async resetPassword(token: string, newPassword: string): Promise<IUser> {
        if (!token) {
            throw new HttpException(400, "Reset token is required");
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, SECRET_KEY) as { sub: string; purpose?: string };
        } catch (error) {
            throw new HttpException(400, "Invalid or expired reset token");
        }

        if (decoded.purpose !== "password-reset") {
            throw new HttpException(400, "Invalid reset token");
        }

        const user = await userRepository.getUserById(decoded.sub);
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        if (!user.passwordResetToken || user.passwordResetToken !== token) {
            throw new HttpException(400, "Invalid or expired reset token");
        }

        if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
            throw new HttpException(400, "Reset token has expired");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        const updatedUser = await userRepository.update(user._id.toString(), {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiresAt: null
        } as any);

        if (!updatedUser) {
            throw new HttpException(500, "Failed to reset password");
        }

        return updatedUser;
    }

    async getAllUsers(): Promise<IUser[]> {
        return await userRepository.getAll();
    }

    async deleteUser(id: string): Promise<boolean> {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpException(404, "User not found");
        return await userRepository.delete(id);
    }

    async updateProfileImage(id: string, imagePath: string | null): Promise<IUser | null> {
        return await userRepository.update(id, { profileImage: imagePath } as any);
    }

    async updateUser(id: string, userData: UpdateUserDTO): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }
        if (userData.email) {
            userData.email = userData.email.trim().toLowerCase();
        }
        if (userData.email && userData.email !== existingUser.email.toLowerCase()) {
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
        if (userData.password) {
            const hashedPassword = await bcryptjs.hash(userData.password, 10);
            userData.password = hashedPassword;
        }
        const updatedUser = await userRepository.update(id, userData as any);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user");
        }
        return updatedUser;
    }
}
