import { Request, Response } from "express";
import { z } from "zod";
import { CartService } from "../services/cart.service";
import { UpsertCartItemDTO } from "../dtos/payment.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
const service = new CartService();
export class CartController {
    async get(req: Request, res: Response) { try { return ApiResponseHelper.success(res, await service.get(req.user!._id.toString())); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
    async upsert(req: Request, res: Response) { const parsed = UpsertCartItemDTO.safeParse(req.body); if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400); try { return ApiResponseHelper.success(res, await service.upsertItem(req.user!._id.toString(), parsed.data.productId, parsed.data.quantity)); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
    async remove(req: Request, res: Response) { try { return ApiResponseHelper.success(res, await service.removeItem(req.user!._id.toString(), String(req.params.productId))); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
    async clear(req: Request, res: Response) { try { await service.clear(req.user!._id.toString()); return ApiResponseHelper.success(res, null, "Cart cleared"); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
}
