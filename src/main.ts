import express from 'express'
import { authenticationController, userController } from './modules';
import { globalErrorHandling } from './middleware';
import { ORIGINS, PORT } from './config';
import { bootstrap } from './DB/connection.db';
import cors from 'cors'
import { postController } from './modules/post';

const  app:express.Application = express();

var corsOptions = {
  origin: function (origin: string, callback: Function) {
    if(!ORIGINS.includes(origin)){
        callback(new Error("Unauthorized Origin" , {cause:{status:401}}) , ORIGINS)
    }else{
        callback(null , ORIGINS)
    }
  }
}
app.use(cors(), express.json())
app.use("/upload" , express.static("./upload"))
bootstrap(app , PORT);

app.all("/" , (req:express.Request , res:express.Response , next:express.NextFunction): express.Response=>{
    return res.status(200).json({message:"Done"})
})

app.use("/auth" , authenticationController)
app.use("/user" , userController)
app.use("/post" , postController)

app.use(globalErrorHandling)
