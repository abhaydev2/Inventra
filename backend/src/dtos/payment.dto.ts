import { z } from "zod";

export const InitiateEsewaPaymentDTO = z.object({ addressId: z.string().regex(/^[a-fA-F0-9]{24}$/, "A valid delivery address is required"), couponCode: z.string().trim().max(64).optional() });
export const UpsertCartItemDTO = z.object({ productId: z.string().regex(/^[a-fA-F0-9]{24}$/), quantity: z.number().int().min(1).max(100) });
export const CreateAddressDTO = z.object({ fullName: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(32), line1: z.string().trim().min(3).max(200), line2: z.string().trim().max(200).optional(), city: z.string().trim().min(2).max(100), district: z.string().trim().min(2).max(100), isDefault: z.boolean().optional() });
