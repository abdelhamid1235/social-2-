
import { ConflictException, NotFoundException } from "../../common/exceptions";
import { UserRepository } from "../../common/repository";
import { PostRepository } from "../../common/repository/post.repository";
import { HPost, HUser } from "../../DB/model";
import { CreatePostDto, GetPostDto } from "./dto/post.dto";

class PostService {
    private readonly postRepository: PostRepository;
    private readonly userRepository: UserRepository;

    constructor() {
        this.postRepository = new PostRepository();
        this.userRepository = new UserRepository();
    }

    async createPost({content}: CreatePostDto["body"],files: Express.Multer.File[], user: HUser):Promise<HPost> {
        
        const post = await this.postRepository.createOne({
                data : {
                    userId: user._id,
                    content,
                    attachments: files.map(ele => ele.path),
                }
            });

        return post;
    }

    async getAllPost(user: HUser) {
        const posts = await this.postRepository.find({
            filter: {
                userId: user._id
            },
            options: {
                sort: {
                    createdAt: -1
                }
            }
        });

        return posts;
    }

    async getOnePost(postId:GetPostDto, user: HUser):Promise<HPost>{
        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if (!post) {
            throw new NotFoundException("Post not found");
        }

        return post;
    }

    async updatePost(postId: string, data: any, user: HUser) {
    const post = await this.postRepository.findOneAndUpdate({
        filter: {
            _id: postId,
            userId: user._id
        },
        update: {
            $set: data
        },
        options: {
            runValidators: true
        }
    });

    if (!post) {
        throw new NotFoundException("Post not found");
    }

    return post;
}

    async deletePost(postId: GetPostDto, user: HUser): Promise<HPost> {
        const post = await this.postRepository.findOneAndDelete({
            filter: {
                _id: postId,
                userId: user._id
            }
        });

        if (!post) {
            throw new NotFoundException("Post not found");
        }

        return post;
}
}
export const postService = new PostService();
