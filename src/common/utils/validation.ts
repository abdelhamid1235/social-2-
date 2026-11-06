import {z} from "zod";
import mongoose from "mongoose";
import { GenderEnum, LanguageEnum } from "../enum";
import { ValidationLangMessages } from "../exceptions";
type ValidationCode = keyof typeof ValidationLangMessages;

export const getValidationlangMessage = (lang: LanguageEnum, code: ValidationCode): string => {
    return lang === LanguageEnum.AR ? ValidationLangMessages[code].ar : ValidationLangMessages[code].en;
};

const matchFields = ({origin , copy , data , ctx , lang}: {origin:string , copy: string, data : any , ctx :z.RefinementCtx, lang: LanguageEnum})=>{
    if(data[origin] != data[copy]){
        ctx.addIssue({
            code : "custom",
            path:[copy],
            message:lang === LanguageEnum.AR ?`فشل في التوافق بين ال ${origin} و ${copy}` : `Faild Match Between ${origin} And ${copy}`
        })
    }
}

export const generaValidationFields = {
    email:(lang: LanguageEnum) => z.email({ error: getValidationlangMessage(lang, 102) }),
    otp:(lang: LanguageEnum) => z.string().regex(/^\d{6}$/ , {error :getValidationlangMessage(lang, 109) }),
    
    password:(lang: LanguageEnum) => z.string()
        .min(8, { error: getValidationlangMessage(lang, 103) })
        .max(20, { error: getValidationlangMessage(lang, 104) })
        .regex( /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!$%^&*~#]).{8,20}$/, { error: getValidationlangMessage(lang, 107) } ),
    
    userName: (lang: LanguageEnum) => z.string()
        .min(5, { error: getValidationlangMessage(lang, 100) })
        .max(50, { error: getValidationlangMessage(lang, 101) })
        .regex( /^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/, { error: getValidationlangMessage(lang, 108) } ), 
    
    confirmPassword: (lang: LanguageEnum) => z.string()
        .min(8, { error: getValidationlangMessage(lang, 103) })
        .max(20, { error: getValidationlangMessage(lang, 104) }), 
    
    phone: (lang: LanguageEnum) => z.string().regex( /^(\+2)?01[0-25]\d{8}$/,{ error: getValidationlangMessage(lang, 105) } ), 

    gender: (lang: LanguageEnum) => z.enum(GenderEnum, { error: getValidationlangMessage(lang, 106) }), 
    id : (lang : LanguageEnum)=> z.string().refine((data)=>{return mongoose.Types.ObjectId.isValid(data)} , {error: "InValid Formate"}),
    file : (lang : LanguageEnum)=> z.strictObject({
                    fieldname: z.string(),
                    originalname: z.string(),
                    encoding: z.string(),
                    mimetype: z.string(),
                    buffer: z.instanceof(Buffer),
                    size: z.number(),
                    path: z.string(),
                }),
    matchFields
}