import { z } from "zod";

export const UserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user"]).default("user"),
    profileImage: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    wishlist: z.array(z.string()).default([]),
    passwordResetToken: z.string().optional().nullable(),
    passwordResetExpiresAt: z.coerce.date().optional().nullable()
});

export type UserType = z.infer<typeof UserSchema>;
