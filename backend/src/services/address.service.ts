import { AddressModel, IAddress } from "../models/address.model";
import { HttpException } from "../exceptions/http-exception";
import { CreateAddressDTO } from "../dtos/payment.dto";
import { z } from "zod";

export class AddressService {
    async list(userId: string): Promise<IAddress[]> { return AddressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 }); }
    async create(userId: string, value: z.infer<typeof CreateAddressDTO>): Promise<IAddress> {
        if (value.isDefault) await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
        return AddressModel.create({ ...value, userId });
    }
    async owned(userId: string, id: string): Promise<IAddress> { const address = await AddressModel.findOne({ _id: id, userId }); if (!address) throw new HttpException(400, "Invalid delivery address"); return address; }
}
