import mongoose, { Document, Schema } from "mongoose";

export type NotificationAudience = "admin" | "user" | "all";
export interface INotification extends Document {
    audience: NotificationAudience; recipientUserId?: mongoose.Types.ObjectId; type: "payment" | "inventory" | "system";
    title: string; message: string; isReadBy: mongoose.Types.ObjectId[]; metadata?: Record<string, unknown>; createdAt: Date; updatedAt: Date;
}
const notificationSchema = new Schema<INotification>({
    audience: { type: String, enum: ["admin", "user", "all"], required: true, index: true },
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["payment", "inventory", "system"], required: true },
    title: { type: String, required: true, maxlength: 140 }, message: { type: String, required: true, maxlength: 500 },
    isReadBy: [{ type: Schema.Types.ObjectId, ref: "User" }], metadata: Schema.Types.Mixed
}, { timestamps: true });
export const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);
