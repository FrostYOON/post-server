import mongoose, { Document } from "mongoose";
import { IPost } from "./posts";
import { IUser } from "./users";

export interface IComment extends Document<mongoose.Types.ObjectId> {
  content: string;
  author: IUser;
  post: IPost;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>("Comment", commentSchema);
