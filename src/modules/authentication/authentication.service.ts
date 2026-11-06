import { EmailSubjectEnum, ProviderEnum } from "../../common/enum";
import { BadReaquestException, ConflictException, NotFoundException, TooManyRequestException } from "../../common/exceptions";
import { UserRepository } from "../../common/repository";
import { compare, hash } from "../../common/security";
import cacheService, { CacheService } from "../../common/service/cache.service";
import { createOtp, emailEvent, userEmailKey, userEmailTrialsKey } from "../../common/utils/email";
import { ConfirmEmailDto, LoginDto, ResentconfirmEmailDto, ResetPasswordDto, SignupDto } from "./dto/authentication.dto";
import { IUser } from "../../common/interface";
import { tokenService, TokenService } from "../../common/service";
import { ILoginResponse, ISignupWithGmailResponse } from "./entities/authentication.entities";
import { WEB_CLIENT_ID } from "../../config";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { HUser } from "../../DB/model";



export class AuthenticationService {
    private readonly userRepository : UserRepository;
    private readonly tokenService : TokenService;
    private readonly cacheService: CacheService;
    private readonly client: OAuth2Client;
    constructor(){
        this.userRepository = new UserRepository();
        this.cacheService = cacheService;
        this.tokenService = tokenService;
        this.client = new OAuth2Client();
    }

    async verifyGoogleAccount(idToken : string):Promise<TokenPayload>{
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if(!payload?.email_verified){
            throw new BadReaquestException("Email Not Verified")
        }
        return payload
    }
    async signupWithGmail({idToken}:{idToken : string}, issuer : string):Promise<ISignupWithGmailResponse>{
        const {email , name , picture} = await this.verifyGoogleAccount(idToken);
        const duplicatedAccount = await this.userRepository.findOne({
            filter : {email : email as string},
        })
        if(duplicatedAccount){
            if(duplicatedAccount.provider != ProviderEnum.GOOGLE) throw new ConflictException("Invalid account");
            return {status : 200 , data : await this.tokenService.createLoginCradential({user : duplicatedAccount , issuer})};
        }
        const user = await this.userRepository.create({
            data:{
                userName : name,
                email : email,
                image : picture,
                confirmEmail : new Date(),
                provider : ProviderEnum.GOOGLE
            },
        })
        return {status : 201 , data : await this.tokenService.createLoginCradential({user , issuer})};
    }

    async sendEmailOtp ({email , subject , userName, expireIn = 120 , maxTrials = 3, blockInSecond = 300}:{email:string , subject : EmailSubjectEnum , userName : String, expireIn?:number, maxTrials? :number, blockInSecond?: number}){
        const existOtp_ttl = await this.cacheService.ttl({key:userEmailKey({email, subject})}) ?? 0;
        if(existOtp_ttl > 0){
            throw new ConflictException(`Sorry we cannt create new otp while existing one still valid please try again after ${existOtp_ttl}`)
        }
        const oldOtpTrials = await this.cacheService.get({key: userEmailTrialsKey({email , subject})});
        if(oldOtpTrials >= maxTrials){
            throw new TooManyRequestException("Max Otp Trials has been reached")
        }
        const code = createOtp();
        await this.cacheService.set({
            key:userEmailKey({email, subject}),
            value:await hash(code.toString()),
            ttl:expireIn
        })
        const currentTrials = await this.cacheService.incrBy({key:userEmailTrialsKey({email , subject}) , value : 1 });
        if(currentTrials == maxTrials){
            await this.cacheService.expire({key:userEmailTrialsKey({email , subject}) , ttl:blockInSecond})
        }
        emailEvent.emit("sendEmail" , {
            recipients:{to:email} , 
            subject, 
            data:{
                code, 
                userName,
            }
        })
    }
    async signup ({userName , email , password , phone}:SignupDto["body"]) : Promise<IUser>{
        const duplicatedAccount = await this.userRepository.findOne({
            filter: {email},
            options: {select : "email"},
        })
        if(duplicatedAccount){
            throw new  ConflictException("Email Exist");
        }
        const user = await this.userRepository.create({
            data:{
                userName,
                email,
                password,
                phone
            },
        });
        await this.sendEmailOtp({email , subject:EmailSubjectEnum.confirm_Email, userName})
        return user;
    }
    async confirmEmail({email , otp}:ConfirmEmailDto):Promise<void>{
        const account = await this.userRepository.findOne({
            filter: {email , provider : ProviderEnum.SYSTEM , confirmEmail:{$exists : false} },
        })
        if(!account){
            throw new NotFoundException("Invalid Account");
        }
        const hashOtp = await this.cacheService.get({
            key:userEmailKey({email, subject: EmailSubjectEnum.confirm_Email})
        })
        if(!hashOtp || !await compare(otp , hashOtp)){
            throw new ConflictException("Invalid OTP");
        }
        account.confirmEmail = new Date()as unknown as string;
        await account.save();

        await this.cacheService.del({key : await this.cacheService.keys({prefix : userEmailKey({email, subject: EmailSubjectEnum.confirm_Email}) })});
        return;
    }
    async resentConfirmEmail ({email}:ResentconfirmEmailDto):Promise<void>{
        const account = await this.userRepository.findOne({
            filter: {email , provider : ProviderEnum.SYSTEM , confirmEmail:{$exists : false} },
        })
        if(!account){
            throw new NotFoundException("Invalid Account");
        }
        await this.sendEmailOtp({email , subject : EmailSubjectEnum.confirm_Email , userName : account.userName})
        return;
    }

    async requestForgetPassword({email}: { email : string}):Promise<void>{
        const account = await this.userRepository.findOne({
            filter: {email , provider : ProviderEnum.SYSTEM , confirmEmail:{$exists : true} },
        })
        if(!account){
            throw new NotFoundException("Invalid Account");
        }
        await this.sendEmailOtp({email , subject : EmailSubjectEnum.forget_password , userName : account.userName})
    }

    async verifyForgetPassword({email , otp}:ConfirmEmailDto):Promise<HUser>{
        const account = await this.userRepository.findOne({
            filter: {email , provider : ProviderEnum.SYSTEM , confirmEmail:{$exists : true} },
        })
        if(!account){
            throw new  NotFoundException("Invalid Account");
        }
        const hashOtp = await this.cacheService.get({
            key:userEmailKey({email, subject: EmailSubjectEnum.forget_password})
        })
        if(!hashOtp || !await compare(otp , hashOtp)){
            throw new ConflictException("Invalid OTP");
        }
        return account;
    }
    async resetPassword ({email , otp , password}: ResetPasswordDto):Promise<void>{
        const account = await this.verifyForgetPassword({email , otp});
        account.password = await hash(password);
        account.changeCradentialTime = new Date();
        await account.save();
        const result = await Promise.all([
            this.cacheService.keys({prefix : this.tokenService.userBaseRevokeTokenKey({userId : account._id})}),
            this.cacheService.keys({prefix : userEmailKey({email, subject: EmailSubjectEnum.forget_password}) })
        ])
        await this.cacheService.del({key:[...result[0] , ...result[1]]});
        return ;
    }

    async login({email , password}:LoginDto , issuer: string): Promise<ILoginResponse>{
        const account = await this.userRepository.findOne({
            filter: {email , provider : ProviderEnum.SYSTEM ,confirmEmail:{$exists : true}},
        })
        if(!account){
            throw new NotFoundException("Invalid Email Or Password");
        }
        const match = await compare(password  , account.password);
        if(!match){
            throw new NotFoundException("Invalid Email Or Password");
        }
        return await this.tokenService.createLoginCradential({user:account , issuer})
    }
}

export default new AuthenticationService();