import mongoose, { Schema, Document } from "mongoose";

export interface ICallLog extends Document {
    fromName: string;
    toName: string;
    type: "audio" | "video";
    duration: string;
    createdAt: Date;
}

const CallLogMongoSchema: Schema = new Schema<ICallLog>(
    {
        fromName: { type: String, required: true },
        toName: { type: String, required: true },
        type: { type: String, enum: ["audio", "video"], default: "audio" },
        duration: { type: String, required: true }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

export const CallLogModel = mongoose.model<ICallLog>("CallLog", CallLogMongoSchema);
