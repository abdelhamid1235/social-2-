export class AplicationException extends Error{
    constructor( override message: string , public status : number ,  override cause?:unknown){
        super();
        this.name = this.constructor.name;
        Error.captureStackTrace(this , this.constructor)
    }
}









