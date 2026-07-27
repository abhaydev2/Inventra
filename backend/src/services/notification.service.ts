import mongoose from "mongoose";
import { NotificationModel, INotification, NotificationAudience } from "../models/notification.model";

export class NotificationService {
    async create(input: { audience: NotificationAudience; recipientUserId?: mongoose.Types.ObjectId; type: INotification["type"]; title: string; message: string; metadata?: Record<string, unknown> }) { return NotificationModel.create(input); }
    async listFor(userId: string, role: string): Promise<INotification[]> {
        return NotificationModel.find({ $or: [{ recipientUserId: userId }, { audience: role === "admin" ? "admin" : "user" }, { audience: "all" }] }).sort({ createdAt: -1 }).limit(50);
    }
    async markAllRead(userId: string, role: string): Promise<void> {
        await NotificationModel.updateMany({ $or: [{ recipientUserId: userId }, { audience: role === "admin" ? "admin" : "user" }, { audience: "all" }], isReadBy: { $ne: userId } }, { $addToSet: { isReadBy: new mongoose.Types.ObjectId(userId) } });
    }
}
