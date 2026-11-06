import mongoose from "mongoose";
import { AccountStatueEnum, GenderEnum, ProviderEnum, RoleEnum } from "../enum"

export interface IUser{
    status: AccountStatueEnum;
    changeStatusAt?:Date;
    firstName:string;
    lastName:string;
    userName: string;
    email:string;
    password:string;
    role:RoleEnum;
    provider:ProviderEnum;
    phone?:string;
    DOB?: string;
    gender?:GenderEnum;
    confirmEmail? : string;
    image?:String;
    coverImage?:string[];
    changeCradentialTime? : Date;
    updatedAt?:string;
    createdAt?:string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
}