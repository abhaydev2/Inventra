import { apiRequest } from "./axios-instance";
export interface AIOverview { deterministic:{totalActiveProducts:number;lowStock:number;outOfStock:number;critical:number;overstock:number;slowMoving:number;inventoryValue:number;estimatedRestockQuantity:number}; analysis:{generatedAt:string;summary:string;overallRisk:string;urgentProducts:Array<{productId:string;productName:string;riskLevel:string;alertType:string;estimatedDaysRemaining:number|null;recommendedReorderQuantity:number;reason:string;recommendedAction:string}>;insights:Array<{title:string;description:string;priority:string}>}; alerts:any[];fallbackUsed:boolean;cached:boolean; }
export const getAIOverview=()=>apiRequest<{data:AIOverview}>("/ai/inventory/overview");
export const refreshAIOverview=()=>apiRequest<{data:AIOverview}>("/ai/inventory/analyze",{method:"POST"});
export interface AIImageAnalysis { id?: string; _id?: string; image: string; observation: string; aiAvailable?: boolean; createdAt: string; }
export async function analyzeInventoryImage(file:File){const body=new FormData();body.append("image",file);return apiRequest<{data:AIImageAnalysis}>("/ai/inventory/image-analysis",{method:"POST",body});}
export const getAIImageHistory=()=>apiRequest<{data:AIImageAnalysis[]}>("/ai/inventory/image-analysis");
export const askAIInventoryQuestion=(question:string)=>apiRequest<{data:{answer:string;generatedAt:string}}>("/ai/inventory/question",{method:"POST",body:JSON.stringify({question})});
