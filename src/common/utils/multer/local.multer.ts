import multer from "multer";
import {randomUUID} from "node:crypto"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {fileTypeFromBuffer} from "file-type"
import { BadReaquestException } from "../../exceptions/index.js";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum/multer.enum.js";
import {tmpdir} from "node:os"
export const fileValidation = {
    image : ["image/jpeg" , "image/png" , "image/gif"],
    files  : ["application/pdf" , "application/json"]
}
export const localFileUpload = ({maxSize = 5 , storageApproach =StorageApproachEnum.MEMORY }: {maxSize?:number , storageApproach?:StorageApproachEnum})=>{
    const storage = storageApproach == StorageApproachEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
        destination : function(req , file , cb){
            cb(null , tmpdir())
        },
        filename : function(req , file , cb){
            console.log({file});
            cb(null , randomUUID() + file.originalname)
        }
    });
    return multer({storage , limits:{fileSize : maxSize * 1024 * 1024} })
}

export const processFile = async ({customPath = "general" , file , validation}:{customPath?:string , file:Express.Multer.File , validation: string[]})=>{
        
    if(file.path){
        file.buffer = await readFile(file.path)
    }
    const result = await fileTypeFromBuffer(file.buffer);
    if(!result || !validation.includes(result.mime)){
        await unlink(file.path)
        throw new BadReaquestException("Invalid File Formate")
    }else{
        // await mkdir(resolve(`./upload/${customPath}`) , {recursive : true});
        // const uniquePath = `upload/${customPath}/${randomUUID()}.${result.ext}`
        // await writeFile(resolve(`./${uniquePath}`), file.buffer)
        if(file.path){
            await unlink(file.path)
        }
        //file.path = uniquePath;
        return file;
    }
}
export const processFiles = async ({customPath = "general" , files , validation}:{customPath?:string , files:Express.Multer.File[] , validation: string[]})=>{
    const upload = []
        for(const file of files){
            const fileUpload = await processFile({customPath,file , validation})
            upload.push(fileUpload)
        }
        return upload;
}

export const processFields = async ({customPath="general",fields, validation} :{customPath?:string , fields:Record<string, Express.Multer.File[]>, validation: string[]})=>{
    const upload = []
    for(const field of Object.keys(fields)){
        const fileUpload = await processFiles({customPath, files : fields[field] as Express.Multer.File[], validation})
        upload.push({field , fileUpload})
    }
    return upload;
}

export const processMulterUpload = async ({req , customPath = "general", validation , isrequird = true}:{req: Request, customPath?: string, validation: string[] , isrequird: boolean})=>{
    if(isrequird && 
        (!req.file && 
            !(Array.isArray(req.files) && req.files?.length) && 
            !(typeof req.files == "object" && Object.keys(req.files)))){
        throw new BadReaquestException("file is required")
    }
    
    
    if(req.file){
        await processFile({customPath,file: req.file, validation})
    }else if(Array.isArray(req.files)){
        await processFiles({customPath,files:req.files , validation})
    }else if(typeof req.files == "object" && Object.keys(req.files)?.length){
        await processFields({customPath, fields :req.files as Record<string, Express.Multer.File[]>, validation})
    }
}