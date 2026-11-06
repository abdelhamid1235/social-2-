import mongoose from "mongoose"

export const objectId = (id : string): mongoose.Types.ObjectId=>{
    return mongoose.Types.ObjectId.createFromHexString(id);
}