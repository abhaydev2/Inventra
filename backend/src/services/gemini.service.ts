import { GoogleGenAI } from "@google/genai";
import { AIInventoryAnalysis, AIInventoryAnalysisSchema } from "../schemas/ai-inventory.schema";
import { analysisJsonSchema, buildInventoryPrompt } from "../prompts/inventory-analysis.prompt";

export class GeminiService {
 async analyze(data: unknown): Promise<AIInventoryAnalysis> {
  if (process.env.GEMINI_ENABLED !== "true") throw new Error("GEMINI_DISABLED");
  const key=process.env.GEMINI_API_KEY; if(!key) throw new Error("GEMINI_NOT_CONFIGURED");
  const client=new GoogleGenAI({ apiKey:key }); const timeout=Number(process.env.GEMINI_REQUEST_TIMEOUT_MS||30000);
  const request=client.models.generateContent({ model:process.env.GEMINI_MODEL||"gemini-2.5-flash", contents:buildInventoryPrompt(data), config:{ responseMimeType:"application/json", responseJsonSchema:analysisJsonSchema as any } } as any);
  const response:any=await Promise.race([request,new Promise((_,reject)=>setTimeout(()=>reject(new Error("GEMINI_TIMEOUT")),timeout))]);
  return AIInventoryAnalysisSchema.parse(JSON.parse(response.text));
 }
 async analyzeImage(image: Buffer, mimeType: string) {
  if (process.env.GEMINI_ENABLED !== "true" || !process.env.GEMINI_API_KEY) throw new Error("GEMINI_NOT_CONFIGURED");
  const client=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY}); const response:any=await client.models.generateContent({ model:process.env.GEMINI_MODEL||"gemini-2.5-flash", contents:[{ role:"user", parts:[{text:"Describe only visible inventory-relevant details in this image. Do not identify people or infer quantities, prices, or stock. Return a concise plain-text observation for a human inventory reviewer."},{inlineData:{mimeType,data:image.toString("base64")}}] }] } as any);
  return String(response.text||"").slice(0,2000);
 }
}
