import {z} from "zod";
import { LanguageEnum } from "../../common/enum";
import { generaValidationFields } from "../../common/utils";


export const loginSchema = (lang : LanguageEnum)=>{
    return z.strictObject({
    email : generaValidationFields.email(lang),
    password : generaValidationFields.password(lang)
})
}
export const login = (lang: LanguageEnum)=>{
    return z.object({
        body:loginSchema(lang)
    })
}

export const signup = (lang : LanguageEnum)=>{
    return z.object({
    body:loginSchema(lang).safeExtend({
        userName:generaValidationFields.userName(lang),
        confirmPassword: generaValidationFields.password(lang),
        phone : generaValidationFields.phone(lang),
        gender: generaValidationFields.gender(lang)

    }).superRefine((data , ctx)=>{
        generaValidationFields.matchFields({origin:"password" , copy:"confirmPassword",data , ctx , lang})
    })
})
}

export const confirmEmail = (lang : LanguageEnum)=>{
    return z.object({
    body:z.strictObject({
        email : generaValidationFields.email(lang),
        otp : generaValidationFields.otp(lang)
    })
})
}
export const resentconfirmEmail = (lang : LanguageEnum)=>{
    return z.object({
    body:z.strictObject({
        email : generaValidationFields.email(lang),
    })
})
}
export const resetPassword = (lang : LanguageEnum)=>{
    return z.object({
    body:z.strictObject({
        email : generaValidationFields.email(lang),
        otp : generaValidationFields.otp(lang),
        password : generaValidationFields.password(lang),
        confirmPassword : generaValidationFields.confirmPassword(lang),
    }).superRefine((data , ctx)=>{
        generaValidationFields.matchFields({origin:"password" , copy:"confirmPassword",data , ctx , lang})
    })
})
}