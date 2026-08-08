import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { InitiateEsewaPaymentDTO, VerifyEsewaPaymentDTO } from "../dtos/payment.dto";
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

    async verifyEsewa(req: Request, res: Response) {
        const parsed = VerifyEsewaPaymentDTO.safeParse(req.body);
        if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
        try {
            const data = await service.verifyEsewa(req.user as any, parsed.data.data);
            return ApiResponseHelper.success(res, data, "eSewa payment verified successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Unable to verify eSewa payment", error.status || 500);
        }
    }
}
