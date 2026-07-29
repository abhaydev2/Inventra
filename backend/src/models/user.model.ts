import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const UserMongoSchema: Schema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        profileImage: { type: String, default: null },
        phone: { type: String, default: null },
        wishlist: [{ type: String, default: [] }],
        passwordResetToken: { type: String, default: null },
        passwordResetExpiresAt: { type: Date, default: null }
    },
    {
        timestamps: true
    }
);

export const UserModel = mongoose.model<IUser>("User", UserMongoSchema);
