import { AplicationException } from "./application.exceptions"

export class BadReaquestException extends AplicationException{
    constructor(message: string = "BadReaquestException" ,  cause?:unknown){
        super(message ,400 , {cause})
    }
}
export class ConflictException extends AplicationException{
    constructor(message: string = "ConflictException" ,  cause?:unknown){
        super(message ,409 , {cause})
    }
}
export class NotFoundException extends AplicationException{
    constructor(message: string = "NotFoundException" ,  cause?:unknown){
        super(message ,404 , {cause})
    }
}
export class UnauthorizedException extends AplicationException{
    constructor(message: string = "UnauthorizedException" ,  cause?:unknown){
        super(message ,401 , {cause})
    }
}
export class ForbiddenException extends AplicationException{
    constructor(message: string = "ForbiddenException" ,  cause?:unknown){
        super(message ,403 , {cause})
    }
}
export class TooManyRequestException extends AplicationException{
    constructor(message: string = "TooManyRequestException" ,  cause?:unknown){
        super(message ,429 , {cause})
    }
}