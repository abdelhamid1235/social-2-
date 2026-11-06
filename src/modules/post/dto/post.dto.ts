import { z } from "zod";
import { createPost, getPost, updatePost } from "../post.validation";

export type CreatePostDto = z.infer<ReturnType<typeof createPost>>;

export type GetPostDto = z.infer<ReturnType<typeof getPost>>["params"]["postId"];

export type UpdatePostDto = z.infer<ReturnType<typeof updatePost>>;