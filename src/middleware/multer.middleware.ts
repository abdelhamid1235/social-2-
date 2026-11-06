import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utils";


export const uploadMiddleware = ({isrequird = true , multerMiddleware , customPath = "general", validation}:{isrequird?:boolean , multerMiddleware:RequestHandler , customPath?:string, validation:string[]})=>{
    return (req:Request , res:Response, next:NextFunction)=>{
         multerMiddleware(req , res , async (err? : any)=>{
        if(err){
            next(new Error(err.message , {cause : {status : 400}}))
            return;
        }
            try{
                await processMulterUpload({req , customPath, validation , isrequird});
                next();
            }catch(err : any){
                next(new Error(err.message , {cause : {status : 400}}))
            }
    })
    }
}