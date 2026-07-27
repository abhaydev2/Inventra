import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const AdminCreateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    username: true,
    password: true,
    role: true
});
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const AdminUpdateUserDTO = UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    username: true,
    password: true,
    role: true
}).partial();
export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
