import { Request, Response } from "express";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { NotificationService } from "../services/notification.service";
const service = new NotificationService();
export class NotificationController {
    async list(req: Request, res: Response) { try { return ApiResponseHelper.success(res, await service.listFor(req.user!._id.toString(), String((req.user as any).role))); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
    async markAllRead(req: Request, res: Response) { try { await service.markAllRead(req.user!._id.toString(), String((req.user as any).role)); return ApiResponseHelper.success(res, null, "Notifications marked as read"); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
}
