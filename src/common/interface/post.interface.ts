import mongoose from "mongoose";

export interface IPost {
    content?: string;
    attachments?: string[];
    userId: mongoose.Types.ObjectId;
}