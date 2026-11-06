import { NextFunction, Request, Response, Router } from "express";
import { authentication, responceFormatter, uploadMiddleware, validation } from "../../middleware";
import { postService } from "./post.service";
import * as validatore from "./post.validation"
import { fileValidation, localFileUpload } from "../../common/utils";


const router = Router({strict:true , caseSensitive: true});

router.post("/", authentication(),
    uploadMiddleware({
        multerMiddleware : localFileUpload({maxSize : 3}).array("attachments", 3),
        customPath : "postFolder" , 
        validation : fileValidation.image
    }),
    validation(validatore.createPost),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.createPost(req.validate.body, req.files as Express.Multer.File[], req.user)
            return {post}
        }    
))

router.get("/",authentication(),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const posts = await postService.getAllPost(req.user)
            return {posts}
        }
    )
);

router.get("/:postId",authentication(),
    validation(validatore.getPost),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.getOnePost(req.validate.params.postId, req.user)
            return {post}
        }
    )
);

router.patch( "/:postId", authentication(), validation(validatore.updatePost),
    responceFormatter(
        async (req: Request, res: Response, next: NextFunction) => {
            const post = await postService.updatePost( req.validate.params.postId, req.validate.body, req.user);
            return post ;
        }
    )
);

router.delete( "/:postId", authentication(),
    validation(validatore.getPost),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.deletePost(req.validate.params.postId, req.user)
            return {post}
        }
    )
);

export default router;
