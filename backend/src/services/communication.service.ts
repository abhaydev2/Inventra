import { CallLogModel, ICallLog } from "../models/call.model";
import { MessageModel, IMessage } from "../models/message.model";

export class CommunicationService {
    async addCallLog(logData: any): Promise<ICallLog> {
        return await CallLogModel.create(logData);
    }

    async getCallLogs(): Promise<ICallLog[]> {
        return await CallLogModel.find().sort({ createdAt: -1 }).limit(20);
    }

    async sendMessage(sender: string, receiver: string, content: string): Promise<IMessage> {
        const userMsg = await MessageModel.create({ sender, receiver, content });
        
        // Auto-reply logic if user sends a message to admin
        if (receiver === "admin@inventhive.com" && sender !== "admin@inventhive.com") {
            let replyContent = "Hi! Thank you for contacting InventHive support team. We have received your query and one of our operators will call you shortly.";
            
            const lowerContent = content.toLowerCase();
            if (lowerContent.includes("discount") || lowerContent.includes("coupon")) {
                replyContent = "Hey there! Try applying the coupon code WELCOME50 at your product checkout screen for a whopping 50% discount off all products!";
            } else if (lowerContent.includes("order") || lowerContent.includes("delivery")) {
                replyContent = "Sure! Please visit the 'Orders List' page to see your current dispatch status. We ship all orders within 24 hours of placement.";
            } else if (lowerContent.includes("electronics") || lowerContent.includes("stock") || lowerContent.includes("headphone")) {
                replyContent = "We have just restocked our Electronics collection! Check out our new Wireless Bluetooth Headphones in the store.";
            }

            // Save automated support agent reply
            await MessageModel.create({
                sender: "admin@inventhive.com",
                receiver: sender,
                content: replyContent
            });
        }

        return userMsg;
    }

    async getMessages(userEmail: string, role: string): Promise<IMessage[]> {
        if (role === "admin") {
            // Admin can see all messages
            return await MessageModel.find().sort({ createdAt: 1 });
        } else {
            // Users see chats sent to or received by them
            return await MessageModel.find({
                $or: [
                    { sender: userEmail, receiver: "admin@inventhive.com" },
                    { sender: "admin@inventhive.com", receiver: userEmail }
                ]
            }).sort({ createdAt: 1 });
        }
    }
}
