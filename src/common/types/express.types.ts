import { HUser } from "../../DB/model";
import { JwtPayloadType } from "../service";

declare module "express-serve-static-core" {
    interface Request{
        validate: any;
        user:HUser;
        payload : JwtPayloadType
    }
}