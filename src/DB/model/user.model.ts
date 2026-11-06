import mongoose, { HydratedDocument } from "mongoose";
import { AccountStatueEnum, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interface";
import { encrypt, hash } from "../../common/security";


const UserSchema = new mongoose.Schema<IUser>({
    firstName:{
        type:String,
        required:true,
        minLength:2,
        MaxLength:25
    },
    lastName:{
        type:String,
        required:true,
        minLength:2,
        MaxLength:25
    },
    email:{
        type:String,
        unique:true,
        required : true
    },
    password:{
        type:String,
        required:function(): boolean{
            return this.provider === ProviderEnum.SYSTEM
        }
    },
    DOB: Date,
    phone:String,
    confirmEmail : Date,
    image:String,
    coverImage:[String],
    gender:{
        type:Number,
        enum:GenderEnum,
        default: GenderEnum.MALE
    },
    role:{
        type:Number,
        enum:RoleEnum,
        default: RoleEnum.USER
    },
    provider:{
        type:Number,
        enum:ProviderEnum,
        default: ProviderEnum.SYSTEM
    },
    changeCradentialTime : Date,
    status:{
        type:Number,
        enum:AccountStatueEnum,
        default: AccountStatueEnum.ACTIVE
    },
    changeStatusAt:Date,
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toObject:{virtuals : true},
    toJSON:{virtuals : true}
})

UserSchema.virtual("userName")
    .set(function(value){
        const [firstName , lastName] = value?.split(" ") || [ ];
        this.set({firstName , lastName});
    })
    .get(function(){
        return `${this.firstName} ${this.lastName}`
    })

UserSchema.pre("save" , async function(){
    if(this.isModified("password")){
        this.password = await hash(this.password)
    }
    if(this.isModified("phone")){
        this.phone = await encrypt(this.phone as string)
    }
})
UserSchema.pre(["findOne" , "find" , "countDocuments"] ,function(){
    const query = this.getFilter();

    if(query.paranoid != false){
        this.setQuery({...query , status:{$ne :AccountStatueEnum.ARCHIVE}})
    }
})
UserSchema.pre(["updateOne" , "updateMany" , "findOneAndUpdate"] ,function(){
    const query = this.getFilter();
    const update = this.getUpdate() as HUser;

    if(update.status == AccountStatueEnum.ACTIVE){
        this.setQuery({...query , status:{$eq :AccountStatueEnum.ARCHIVE}})
    }else if(update.status == AccountStatueEnum.ARCHIVE){
        this.setQuery({...query , status:{$ne :AccountStatueEnum.ARCHIVE}})
    }
    if(!update.status && query.paranoid != false){
        this.setQuery({...query , status:{$ne :AccountStatueEnum.ARCHIVE}})
    }

    this.setUpdate({
        ...this.getUpdate(),
        ...(update.status ? { changeStatusAt : new Date()} : {})
    })
})
UserSchema.pre(["deleteOne" , "deleteMany" , "findOneAndDelete"] ,function(){
    const query = this.getFilter();

    if(!query.force){
        this.setQuery({...query , status:{$eq :AccountStatueEnum.ARCHIVE}})
    }
})



export const  UserModel = mongoose.models.User || mongoose.model<IUser>("User" , UserSchema);

export type HUser = HydratedDocument<IUser>;