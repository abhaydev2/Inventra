import { Request, Response } from "express";
import { CommunicationService } from "../services/communication.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const commsService = new CommunicationService();

export class CommunicationController {
    async addCallLog(req: Request, res: Response) {
        try {
            const fromName = `${(req.user as any).firstName || ""} ${(req.user as any).lastName || ""}`.trim();
            const logData = {
                ...req.body,
                fromName
            };
            const newLog = await commsService.addCallLog(logData);
            return ApiResponseHelper.success(res, newLog, "Call log saved successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to save call log",
                error.status || 500
            );
        }
    }

    async getCallLogs(req: Request, res: Response) {
        try {
            const logs = await commsService.getCallLogs();
            return ApiResponseHelper.success(res, logs, "Call logs fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to fetch call logs",
                error.status || 500
            );
        }
    }

    async sendMessage(req: Request, res: Response) {
        try {
            const sender = (req.user as any).email;
            const { receiver, content } = req.body;
            const newMsg = await commsService.sendMessage(sender, receiver, content);
            return ApiResponseHelper.success(res, newMsg, "Message sent successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to send message",
                error.status || 500
            );
        }
    }

    async getMessages(req: Request, res: Response) {
        try {
            const userEmail = (req.user as any).email;
            const role = (req.user as any).role;
            const messages = await commsService.getMessages(userEmail, role);
            return ApiResponseHelper.success(res, messages, "Messages fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to fetch messages",
                error.status || 500
            );
        }
    }
}
