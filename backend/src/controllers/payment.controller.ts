import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { InitiateEsewaPaymentDTO } from "../dtos/payment.dto";
import { PaymentService } from "../services/payment.service";
const service = new PaymentService();
export class PaymentController {
    async initiateEsewa(req: Request, res: Response) {
        const parsed = InitiateEsewaPaymentDTO.safeParse(req.body);
        if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
        try {
            const data = await service.initiateEsewa(req.user as any, parsed.data.addressId, parsed.data.couponCode);
            return ApiResponseHelper.success(res, data, "eSewa payment initiated successfully", 201);
        } catch (error: any) { return ApiResponseHelper.error(res, error.message || "Unable to initiate eSewa payment", error.status || 500); }
    }
}
