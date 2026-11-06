import mongoose, { HydratedDocument } from "mongoose";
import { IPost } from "../../common/interface";

const PostSchema = new mongoose.Schema({
    content:{
        type:String,
        required:function() : boolean{ 
            return this.attachments?.length > 0 ? false : true},
        minLength:2,
        MaxLength:50000
    },
    attachments:[String],
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
},
{
    timestamps:true,
    strict:true,
    strictQuery:true,
    toObject:{virtuals : true},
    toJSON:{virtuals : true}
})

export const  PostModel = mongoose.models.Post || mongoose.model<IPost>("Post" , PostSchema);

export type HPost = HydratedDocument<IPost>;