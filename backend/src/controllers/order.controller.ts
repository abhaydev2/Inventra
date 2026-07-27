import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const orderService = new OrderService();

export class OrderController {
    async createOrder(req: Request, res: Response) {
        try {
            const customerEmail = (req.user as any).email;
            const customerName = `${(req.user as any).firstName || ""} ${(req.user as any).lastName || ""}`.trim();
            const orderData = { ...req.body, customerEmail, customerName, customerId: (req.user as any)._id };
            const newOrder = await orderService.createOrder(orderData);
            return ApiResponseHelper.success(res, newOrder, "Order placed successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to create order",
                error.status || 500
            );
        }
    }

    async getOrders(req: Request, res: Response) {
        try {
            const userEmail = (req.user as any).email;
            const role = (req.user as any).role;
            const orders = await orderService.getOrders(userEmail, role);
            return ApiResponseHelper.success(res, orders, "Orders fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to fetch orders",
                error.status || 500
            );
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            const id = String(req.params.id);
            const { status } = req.body;
            const updated = await orderService.updateOrderStatus(id, status);
            return ApiResponseHelper.success(res, updated, "Order status updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Failed to update order status",
                error.status || 500
            );
        }
    }
}
