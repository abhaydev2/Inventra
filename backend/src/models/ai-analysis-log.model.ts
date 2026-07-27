import mongoose, { Document, Schema } from "mongoose";
export interface IAIAnalysisLog extends Document { requestedBy: mongoose.Types.ObjectId; model: string; productCount: number; aiSucceeded: boolean; fallbackUsed: boolean; durationMs: number; result: Record<string, unknown>; expiresAt: Date; createdAt: Date; }
const schema = new Schema<IAIAnalysisLog>({ requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, model: String, productCount: Number, aiSucceeded: Boolean, fallbackUsed: Boolean, durationMs: Number, result: Schema.Types.Mixed, expiresAt: { type: Date, required: true, index: true } }, { timestamps: true });
export const AIAnalysisLogModel = mongoose.model<IAIAnalysisLog>("AIAnalysisLog", schema);
