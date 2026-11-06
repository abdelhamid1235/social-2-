import { tokenService } from './../common/service';
import { RoleEnum, TokenTypeEnum } from "../common/enum";
import { NextFunction, Request, Response } from 'express';
import { ForbiddenException, UnauthorizedException } from '../common/exceptions';

export const bearAuth = async({ req , tokenType = TokenTypeEnum.ACCESS} : {req:Request , tokenType: TokenTypeEnum})=>{
    const [key , credential] = (req.headers["authorization"]?.split(" ")|| []) as [string , string];
    const {user , payload} = await tokenService.decodeToken({authorization:credential , tokenType});
    req.user = user;
    req.payload = payload;
} 

export const authentication = (tokenType = TokenTypeEnum.ACCESS )=>{
    return async (req:Request , res:Response  , next: NextFunction)=>{
    const {authorization} = req.headers;
    if(!authorization) throw new UnauthorizedException("Unauthorized Account");
    const [key , credential] = (authorization.split(" ")|| []) as [string , string];
    switch (key) {
        case "Bearer":
            await bearAuth({req , tokenType})
            break;
        case "Basic":
            const [email, password] = (Buffer.from(credential , "base64").toString().split(":")) as [string , string];
            console.log({email, password});
            req.user = await tokenService.basicAuth({email, password});
            break;
        default:
            next(new Error("Invalid Authorization Key" , {cause : {status : 400}}));
    }
    next();
}
}


export const authorization = (accessRoles : RoleEnum)=>{
    return async (req:Request , res:Response  , next: NextFunction)=>{
        if(req.user.role < accessRoles){
            throw new ForbiddenException("Not Allowed");
        }
        next();
    }
}