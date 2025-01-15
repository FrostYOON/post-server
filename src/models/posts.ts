import mongoose, { Document } from "mongoose";
import { IUser } from "./users";
import { IComment } from "./comments";

export interface IPost extends Document<mongoose.Types.ObjectId> {
  title: string;
  content: string;
  author: IUser;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }]
  },
  {
    timestamps: true,
  }
);
PostSchema.index({ index: -1 });
export default mongoose.model<IPost>("Post", PostSchema);
