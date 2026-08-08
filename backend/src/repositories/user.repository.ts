import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    getPaginatedUsers(
        page: number,
        limit: number,
        search?: string
    ): Promise<{ users: IUser[]; total: number }>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        return await UserModel.findOne({ _id: id });
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const normalizedEmail = email.trim();
        const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return await UserModel.findOne({
            email: { $regex: `^${escapedEmail}$`, $options: "i" }
        });
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        return await UserModel.findOne({ username });
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        return await UserModel.create(user);
    }

    async getAll(): Promise<IUser[]> {
        return await UserModel.find().select("-password");
    }

    async getPaginatedUsers(
        page: number,
        limit: number,
        search?: string
    ): Promise<{ users: IUser[]; total: number }> {
        const query: any = {};
        if (search) {
            const trimmedSearch = search.trim();
            query.$or = [
                { firstName: { $regex: trimmedSearch, $options: "i" } },
                { lastName: { $regex: trimmedSearch, $options: "i" } },
                { email: { $regex: trimmedSearch, $options: "i" } },
                { username: { $regex: trimmedSearch, $options: "i" } }
            ];
            
            // Support first + last name searches (e.g. "John Doe")
            const parts = trimmedSearch.split(/\s+/).filter(Boolean);
            if (parts.length > 1) {
                query.$or.push({
                    $and: [
                        { firstName: { $regex: parts[0], $options: "i" } },
                        { lastName: { $regex: parts[1], $options: "i" } }
                    ]
                });
            }
        }

        const total = await UserModel.countDocuments(query);
        const users = await UserModel.find(query)
            .select("-password")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        return { users, total };
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, user, { new: true }).select("-password");
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
