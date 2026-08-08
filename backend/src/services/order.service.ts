import { OrderModel, IOrder } from "../models/order.model";
import { ProductModel } from "../models/product.model";
import { HttpException } from "../exceptions/http-exception";

export class OrderService {
    async createOrder(orderData: any): Promise<IOrder> {
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new HttpException(400, "At least one order item is required");
        }
        const safeItems: IOrder["items"] = [];
        let subtotal = 0;
        // Product names and prices are always taken from MongoDB, never from the browser.
        for (const item of orderData.items) {
            if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new HttpException(400, "Invalid item quantity");
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new HttpException(404, "Product not found");
            }
            if (product.quantity < item.quantity) {
                throw new HttpException(400, `Insufficient stock for product: ${product.name}`);
            }
            
            // Decrement stock and increment salesCount
            product.quantity = Math.max(0, product.quantity - item.quantity);
            product.salesCount = (product.salesCount || 0) + item.quantity;
            await product.save();
            safeItems.push({ productId: product._id.toString(), name: product.name, price: product.price, quantity: item.quantity });
            subtotal += product.price * item.quantity;
        }
        const couponCode = typeof orderData.couponApplied === "string" ? orderData.couponApplied.trim().toUpperCase() : "";
        const coupons: Record<string, { type: "percentage" | "fixed"; value: number }> = { SHOELOVE20: { type: "percentage", value: 20 }, FIRST10: { type: "percentage", value: 10 }, HIVE500: { type: "fixed", value: 500 }, WELCOME50: { type: "percentage", value: 50 } };
        const coupon = couponCode ? coupons[couponCode] : undefined;
        if (couponCode && !coupon) throw new HttpException(400, "Invalid coupon code");
        const discount = coupon ? Math.min(subtotal, coupon.type === "percentage" ? Math.round(subtotal * coupon.value) / 100 : coupon.value) : 0;
        const newOrder = await OrderModel.create({ customerId: orderData.customerId, customerName: orderData.customerName, customerEmail: orderData.customerEmail, customerPhone: orderData.customerPhone || "", items: safeItems, subtotal, discount, taxAmount: 0, deliveryCharge: 0, serviceCharge: 0, total: subtotal - discount, couponApplied: couponCode, paymentMethod: "cod", paymentStatus: "pending", status: "confirmed" });
        return newOrder;
    }

    async getOrders(userId: string, role: string): Promise<IOrder[]> {
        if (role === "admin") {
            // Admin fetches all orders
            return await OrderModel.find().sort({ createdAt: -1 });
        } else {
            // Users only see their own successfully placed COD orders and
            // verified eSewa orders. Pending/failed eSewa attempts stay hidden.
            return await OrderModel.find({
                customerId: userId,
                $or: [
                    { paymentMethod: "cod" },
                    { paymentMethod: "esewa", paymentStatus: "completed" }
                ]
            }).sort({ createdAt: -1 });
        }
    }

    async updateOrderStatus(orderId: string, status: string): Promise<IOrder | null> {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            throw new HttpException(404, "Order not found");
        }
        order.status = status as any;
        await order.save();
        return order;
    }
}
