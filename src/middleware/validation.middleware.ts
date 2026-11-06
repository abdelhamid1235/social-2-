import { NextFunction, Request, Response } from "express";
import { LanguageEnum } from "../common/enum";
import { BadReaquestException } from "../common/exceptions";
import { ZodType } from "zod";

type ValidationSchemaType = (lang : LanguageEnum)=> ZodType
export const validation = (schema : ValidationSchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const lang = Number(req.headers["accept-language"] ?? LanguageEnum.EN);
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            // files: req.files,
            // file: req.file,
        });
        if (!validationResult.success){
            throw new BadReaquestException("Validation Error" , validationResult.error.issues)
        }
        req.validate = validationResult.data
        next();
    }
}
