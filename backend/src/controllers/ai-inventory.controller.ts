import { Request, Response } from "express";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { AIInventoryService } from "../services/ai-inventory.service";
import fs from "fs";
import { z } from "zod";
const service=new AIInventoryService();
export class AIInventoryController {
 async overview(req:Request,res:Response){try{return ApiResponseHelper.success(res,await service.overview(req.user!._id.toString()),"AI inventory overview");}catch(e:any){return ApiResponseHelper.error(res,"AI inventory analysis is temporarily unavailable.",503);}}
 async analyze(req:Request,res:Response){try{return ApiResponseHelper.success(res,await service.overview(req.user!._id.toString(),true),"AI analysis refreshed");}catch(e:any){return ApiResponseHelper.error(res,"AI inventory analysis is temporarily unavailable.",503);}}
 async alerts(req:Request,res:Response){try{return ApiResponseHelper.success(res,await service.alerts(req.query));}catch(e:any){return ApiResponseHelper.error(res,e.message,500);}}
 async forecast(req:Request,res:Response){const days=Number(req.query.days||14);if(![7,14,30].includes(days))return ApiResponseHelper.error(res,"Forecast days must be 7, 14, or 30",400);try{return ApiResponseHelper.success(res,await service.forecast(days));}catch(e:any){return ApiResponseHelper.error(res,e.message,500);}}
 async product(req:Request,res:Response){try{const result=await service.product(String(req.params.productId));return result?ApiResponseHelper.success(res,result):ApiResponseHelper.error(res,"Product not found",404);}catch(e:any){return ApiResponseHelper.error(res,e.message,500);}}
 async image(req:Request,res:Response){if(!req.file)return ApiResponseHelper.error(res,"Image file is required",400);try{return ApiResponseHelper.success(res,await service.image(req.user!._id.toString(),req.file));}catch(e:any){if(req.file?.path&&fs.existsSync(req.file.path))fs.unlinkSync(req.file.path);return ApiResponseHelper.error(res,"Image analysis is temporarily unavailable.",503);}}
 async imageHistory(req:Request,res:Response){try{return ApiResponseHelper.success(res,await service.imageHistory(req.user!._id.toString()));}catch(e:any){return ApiResponseHelper.error(res,"Could not load image analysis history.",500);}}
 async question(req:Request,res:Response){const parsed=z.object({question:z.string().trim().min(3,"Please enter a fuller inventory question.").max(600,"Question must be 600 characters or less.")}).safeParse(req.body);if(!parsed.success)return ApiResponseHelper.error(res,z.prettifyError(parsed.error),400);try{return ApiResponseHelper.success(res,await service.question(parsed.data.question));}catch(e:any){return ApiResponseHelper.error(res,"AI answers are temporarily unavailable. Add a Gemini API key to enable this feature.",503);}}
}
