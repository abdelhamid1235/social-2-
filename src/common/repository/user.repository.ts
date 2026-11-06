import { UserModel } from "../../DB/model/user.model.js";
import { IUser } from "../interface/user.interface.js";
import { DataBaseRepository } from "./base.repository";


export class UserRepository extends DataBaseRepository <IUser> {
    constructor(){
        super(UserModel)
    };

}