import { NextFunction, Request, Response, Router } from "express";
import { authentication, responceFormatter } from "../../middleware";
import { postService } from "./post.service";


const router = Router({strict:true , caseSensitive: true});


router.post("/", authentication(),responceFormatter(
    async (req:Request , res:Response , next:NextFunction)=>{
        const post = await postService.createPost(req.body , req.user)
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
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.getOnePost(req.params.postId as string, req.user)
            return {post}
        }
    )
);

router.patch("/:postId", authentication(),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.updatePost(req.params.postId as string , req.body , req.user)
            return {post}
        }
    )
);

router.delete( "/:postId", authentication(),
    responceFormatter(
        async (req:Request , res:Response , next:NextFunction)=>{
            const post = await postService.deletePost(req.params.postId as string , req.user)
            return {post}
        }
    )
);

export default router;
