import { cloudService } from './../../common/service/cloud.service';
import mongoose from "mongoose";
import { LogoutEnum } from "../../common/enum";
import { ConflictException } from "../../common/exceptions";
import { UserRepository } from "../../common/repository";
import { CacheService, CloudService, JwtPayloadType, tokenService, TokenService } from "../../common/service";
import cacheService from "../../common/service/cache.service";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { HUser } from "../../DB/model";
import { ILoginResponse } from "../authentication/entities/authentication.entities";
import { IFileType } from '../../common/types';

export class UserService{
    private readonly userRepository : UserRepository;
    private readonly tokenService : TokenService;
    private readonly cacheService: CacheService;
    private readonly cloudService: CloudService;
    
    constructor(){
        this.userRepository = new UserRepository();
        this.cacheService = cacheService;
        this.tokenService = tokenService;
        this.cloudService = cloudService;
    }

    async profile(user : HUser){
        return user;
    }

    async profileImage(file: IFileType , user: HUser):Promise<string>{
        const key = await this.cloudService.uploadAsset({
            file , 
            folders : `user/${user._id.toString()}`})
        return key;
    }

    async update(user: HUser, data: any) {
        const account = await this.userRepository.findByIdAndUpdate({
            _id: user._id,
            update: data,
        });

        return account;
    }

    async rotate_token (payload:JwtPayloadType , user: HUser , issuer: string):Promise<ILoginResponse>{
        const accessTokenExpairIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (2 * 60 * 1000);
        if(currentTime < accessTokenExpairIn){
            throw new  ConflictException("Sorry we cannot create new login credantial while current access token still Valid")
        }
        const data =  await this.tokenService.createLoginCradential({user , issuer})
        await this.tokenService.revokeToken({payload});
        return data;
    }

    async logout (payload:JwtPayloadType , user: HUser, {action = LogoutEnum.DEVICE}:{action : LogoutEnum}):Promise<void>{
        switch (action) {
            case LogoutEnum.ALL:
                user.changeCradentialTime = new Date();
                await user.save();
                await this.cacheService.del({key:await this.cacheService.keys({prefix : this.tokenService.userBaseRevokeTokenKey({userId : payload.sub})})})
                break;
            default:
                await this.tokenService.revokeToken({payload});
                break;
        }
        
    }
    async follow(user: HUser, targetId: mongoose.Types.ObjectId) {
        if (user._id.toString() === targetId.toString()) {
            throw new Error("You cannot follow yourself");
        }
        const target = await this.userRepository.findById({
            id: targetId
        });
        if (!target) {
            throw new ConflictException("User not found");
        }
        await Promise.all([
            this.userRepository.findByIdAndUpdate({
                _id: user._id,
                update: {
                    $addToSet: {
                        following: targetId
                    }
                }
            }),
            this.userRepository.findByIdAndUpdate({
                _id: targetId,
                update: {
                    $addToSet: {
                        followers: user._id
                    }
                }
            })
        ]);
        return { message: "Followed successfully" };
    }
    async unfollow(user: HUser, targetId: mongoose.Types.ObjectId) {

    if (user._id.toString() === targetId.toString()) {
        throw new Error("You cannot unfollow yourself");
    }
    await Promise.all([
        this.userRepository.findByIdAndUpdate({
            _id: user._id,
            update: {
                $pull: {
                    following: targetId
                }
            }
        }),
        this.userRepository.findByIdAndUpdate({
            _id: targetId,
            update: {
                $pull: {
                    followers: user._id
                }
            }
        })
    ]);

    return { message: "Unfollowed successfully"};
}
}

export const userService = new UserService();