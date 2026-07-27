import { Request, Response } from "express";
import { z } from "zod";
import { AddressService } from "../services/address.service";
import { CreateAddressDTO } from "../dtos/payment.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
const service = new AddressService();
export class AddressController {
    async list(req: Request, res: Response) { try { return ApiResponseHelper.success(res, await service.list(req.user!._id.toString())); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
    async create(req: Request, res: Response) { const parsed = CreateAddressDTO.safeParse(req.body); if (!parsed.success) return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400); try { return ApiResponseHelper.success(res, await service.create(req.user!._id.toString(), parsed.data), "Address saved", 201); } catch (e: any) { return ApiResponseHelper.error(res, e.message, e.status || 500); } }
}
