import { NextFunction, Request, Response, Router } from "express";
import authService from "./authentication.service";
import { responceFormatter, validation } from "../../middleware";
import * as validatiors from "./authentication.validation"
import { IResponse, IUser } from "../../common/interface";
import { getIssuer } from "../../common/utils";
import { ILoginResponse } from "./entities/authentication.entities";


const router = Router({strict:true , caseSensitive: true});


router.post("/signup-with-gmail",
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction): Promise<IResponse<ILoginResponse>>=>{
        const {status , data} = await authService.signupWithGmail(req.body , getIssuer(req))
        return {data , status}
    })
)

router.post("/signup" ,
    validation(validatiors.signup),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction): Promise<IResponse<IUser>>=>{
        const data = await authService.signup(req.validate.body)
        return {data , status: 201}
}
))
router.patch("/confirm-email" ,
    validation(validatiors.confirmEmail),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        await authService.confirmEmail(req.validate.body)
}
))
router.patch("/resent-confirm-email" ,
    validation(validatiors.resentconfirmEmail),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        await authService.resentConfirmEmail(req.validate.body)
}
))

router.post("/request-forget-password-code" ,
    validation(validatiors.resentconfirmEmail),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        await authService.requestForgetPassword(req.validate.body)
}
))
router.post("/verify-forget-password" ,
    validation(validatiors.confirmEmail),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        await authService.verifyForgetPassword(req.validate.body)
}
))
router.patch("/reset-password" ,
    validation(validatiors.resetPassword),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        await authService.resetPassword(req.validate.body)
}
))

router.post("/login" ,
    validation(validatiors.login),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction): Promise<IResponse<ILoginResponse>>=>{
        const data = await authService.login(req.validate.body , getIssuer(req))
        return {data}
}
))

export default router;