import { NextFunction, Request, Response, Router } from "express";
import { authentication, authorization, responceFormatter, uploadMiddleware } from "../../middleware";
import { RoleEnum, TokenTypeEnum } from "../../common/enum";
import { userService } from "./user.service";
import { fileValidation, getIssuer, localFileUpload, objectId } from "../../common/utils";
import { IFileType } from "../../common/types";
import { IResponse } from "../../common/interface";


const router = Router({strict:true , caseSensitive: true});
router.post("/profile-image" ,
    authentication(),
    uploadMiddleware({
        multerMiddleware : localFileUpload({maxSize : 3}).single("attachment"),
        customPath : "User" , 
        validation : fileValidation.image
    }),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction):Promise<IResponse<Record<string, string>>>=>{
        const key = await userService.profileImage(req.file as IFileType , req.user)
        return {data : {key}}
}
))

router.get("/" ,
    authentication(),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        const data = await userService.profile(req.user)
        return data
}
))
router.patch("/" ,
    authentication(),
    authorization(RoleEnum.USER),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        const data = await userService.update(req.user , req.body)
        return data
}
))
router.post(
    "/:id/follow",
    authentication(),
    responceFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await userService.follow(
                req.user,
                objectId(req.params.id as string)
            );

            return data;
        }
    )
);
router.delete(
    "/:id/follow",
    authentication(),
    responceFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await userService.unfollow(
                req.user,
                objectId(req.params.id as string)
            );

            return data;
        }
    )
);
router.post("/rotate_token" ,
    authentication(TokenTypeEnum.REFRESH),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        const data = await userService.rotate_token(req.payload , req.user , getIssuer(req))
        return data
}
))
router.post("/logout" ,
    authentication(),
    responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        const data = await userService.logout(req.payload , req.user , req.body)
        return data
}
))

export default router;