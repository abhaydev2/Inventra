import mongoose, { Document, Schema } from "mongoose";

export interface IAIImageAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  image: string;
  observation: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiImageAnalysisSchema = new Schema<IAIImageAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  image: { type: String, required: true },
  observation: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true });

export const AIImageAnalysisModel = mongoose.model<IAIImageAnalysis>("AIImageAnalysis", aiImageAnalysisSchema);
