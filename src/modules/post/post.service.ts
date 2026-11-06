
import { ConflictException, NotFoundException } from "../../common/exceptions";
import { PostRepository } from "../../common/repository/post.repository";
import { HPost, HUser } from "../../DB/model";

class PostService {
    private readonly postRepository: PostRepository;

    constructor() {
        this.postRepository = new PostRepository();
    }

    async createPost(data: any, user: HUser) {
    const post = await this.postRepository.createOne({
            data: {
                ...data,
                userId: user._id
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

    async getOnePost(postId: string, user: HUser):Promise<HPost>{
        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if(!post){
            throw new ConflictException("Post not found")
        }

        return post;
    }

    async updatePost(postId: string, user: HUser, data: any) {
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

        return post;
    }

    async deletePost(postId: string, user: HUser){
        const post = await this.postRepository.findOneAndDelete({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if(!post) throw new NotFoundException("InValid post Id");
        return post;
    }
}

export const postService = new PostService();
