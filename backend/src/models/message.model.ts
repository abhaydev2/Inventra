import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender: string;
    receiver: string;
    content: string;
    createdAt: Date;
}

const MessageMongoSchema: Schema = new Schema<IMessage>(
    {
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        content: { type: String, required: true }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

export const MessageModel = mongoose.model<IMessage>("Message", MessageMongoSchema);
