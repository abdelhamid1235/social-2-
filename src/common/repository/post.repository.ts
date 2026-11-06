import { PostModel } from "../../DB/model";
import { IPost } from "../interface";
import { DataBaseRepository } from "./base.repository";


export class PostRepository extends DataBaseRepository <IPost> {
    constructor(){
        super(PostModel)
    };

}