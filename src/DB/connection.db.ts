import mongoose from "mongoose"
import { DB_URI } from "../config"
import { Application } from "express";
import { UserModel} from "./model/user.model";


export const bootstrap = async (app:Application , port: number)=>{
    try {
        await mongoose.connect(DB_URI);
        console.log("DB Connection Successfully ✔️");
        await UserModel.syncIndexes();
        app.listen(port, () => console.log(`Example app listening on port ${port}!`))
    } catch (error) {
        console.log({error});
        console.log("Fail TO Connection DB ❌");
    }
}