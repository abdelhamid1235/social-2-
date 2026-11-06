import cacheService, { CacheService } from './cache.service';
import { UserRepository } from "../repository"
import mongoose from 'mongoose';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from '../../config';
import { RoleEnum, TokenTypeEnum } from '../enum';
import { BadReaquestException, NotFoundException, UnauthorizedException } from '../exceptions';
import { objectId } from '../utils';
import { HUser } from '../../DB/model';
import { randomUUID } from 'crypto';
import { compare } from '../security';

type userIdType = mongoose.Types.ObjectId | string;

export type JwtPayloadType = JwtPayload &{
    sub : string;
    aud: number[];
    jti: string;
    iat : number

}

export class TokenService {
    private userRepository : UserRepository;
        private readonly cacheService: CacheService;
        constructor(){
            this.userRepository = new UserRepository();
            this.cacheService = cacheService;
        }
        userBaseKey({userId} : {userId : userIdType}): string{
            return `user::${userId.toString()}`
        }
        userBaseRevokeTokenKey({userId}: {userId : userIdType}): string{
            return `${this.userBaseKey({userId})}::revokeToken`
        }
        userRevokeTokenKey({userId , jti}: {userId : userIdType , jti : string}): string{
            return `${this.userBaseRevokeTokenKey({userId})}::${jti}`
        }

        async createToken({
            payload,
            options,
            secret = ACCESS_USER_TOKEN_SIGNATURE
        } :{
            payload: string | Buffer | object,
            secret: Secret,
            options?: SignOptions,
        }):Promise<string>{
            return jwt.sign(payload ,secret , options )
        }

        async verifyToken ({
            token,
            secret = ACCESS_USER_TOKEN_SIGNATURE
        }:{
            token : string,
            secret: Secret,
        }):Promise<JwtPayloadType>{
            return jwt.verify(token , secret) as JwtPayloadType
        }

        async getTokenSignature({role = RoleEnum.USER} :{ role : RoleEnum} ):Promise<{accessSignature : string , refreshSignature : string}>{
            let signature : {accessSignature : string , refreshSignature : string} ;
            switch (role) {
                case RoleEnum.ADMIN:
                    signature = {accessSignature : ACCESS_ADMIN_TOKEN_SIGNATURE , refreshSignature : REFRESH_ADMIN_TOKEN_SIGNATURE}
                    break;
                default:
                    signature = {accessSignature : ACCESS_USER_TOKEN_SIGNATURE , refreshSignature : REFRESH_USER_TOKEN_SIGNATURE}
                    break;
            }
            return signature;
        }
        async getSignature({
            tokenType = TokenTypeEnum.ACCESS , 
            role=RoleEnum.USER
        }:{
            tokenType : TokenTypeEnum , 
            role?:RoleEnum
        }):Promise<string>{
            const signature = await this.getTokenSignature({role});
            return tokenType == TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature;
        }

        async decodeToken({
            authorization = "",
            tokenType = TokenTypeEnum.ACCESS
        }:{
            authorization: string,
            tokenType? : TokenTypeEnum
        }) : Promise<{user: HUser , payload : JwtPayloadType}>{
            const decodded = jwt.decode(authorization) as JwtPayloadType;
            if(!decodded?.aud?.length){
                throw new BadReaquestException("missing token payload");
            }
            const payload = await this.verifyToken({
                token : authorization,
                secret : await this.getSignature({tokenType , role: decodded.aud[0] as unknown as RoleEnum})
            });
            if(!payload?.sub) throw new BadReaquestException("missing token payload");
            if(await this.cacheService.exist({key :this.userRevokeTokenKey({userId : payload.sub , jti:payload.jti})})){
                throw new  UnauthorizedException("Expire login Cradential");
            }
            const user = await this.userRepository.findById({
                id : objectId(payload.sub),
            })
            if(!user) throw new NotFoundException("Invalid User");

            if((user.changeCradentialTime?.getTime()?? 0) > payload.iat * 1000){
                throw new  UnauthorizedException("Expire login Cradential All Device");
            }
            return {user , payload};
        }

        async createLoginCradential({
            user,
            issuer
        }:{
            user:HUser ,
            issuer:string
        }): Promise<{access_token:string , refresh_token:string}>{
            const {accessSignature , refreshSignature} = await this.getTokenSignature({role : user.role})
            const jwtid = randomUUID();
            const access_token = await this.createToken({
                payload :{},
                secret : accessSignature,
                options:{
                    subject: user.id,
                    issuer,
                    audience: [ user.role as unknown as string],
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                    jwtid
                }
            })
            const refresh_token = await this.createToken({
                payload:{},
                secret : refreshSignature,
                options:{
                    subject: user.id,
                    issuer,
                    audience: [ user.role as unknown as string],
                    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                    jwtid
                },
            })
            return {access_token , refresh_token};
        }

        async basicAuth({email , password}:{email : string , password : string}):Promise<HUser>{
            const user = await this.userRepository.findOne({
                filter: {email},
                options: {select : "email"},
            })
            if(!user){
                throw new  NotFoundException("Invalid Email Or Password");
            }
            const match = await compare(password  , user.password);
            if(!match) throw new NotFoundException("Invalid Email Or Password");
            return user;
        }

        async revokeToken({payload}: {payload : JwtPayloadType}):Promise<void>{
            const consumedtime = Math.ceil(Date.now() / 1000) - payload.iat;
            const refreshtime = payload.iat  + REFRESH_TOKEN_EXPIRES_IN;
            const ttl = refreshtime - consumedtime;
            await this.cacheService.set({key:this.userRevokeTokenKey({userId:payload.sub , jti:payload.jti}),value : payload.jti , ttl})
        }
}
    export const tokenService = new TokenService();
