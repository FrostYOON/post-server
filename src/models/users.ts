import mongoose, { Schema, Document, Types } from "mongoose";
import { IPost } from "./posts";
import { IComment } from "./comments";
import bcrypt from "bcrypt";

export interface IUser extends Document<mongoose.Types.ObjectId> {
  username: string;
  email: string;
  password: string;
  registerType: "normal" | "google";
  socialId: string;
  birth: Date;
  posts: IPost[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.*\@.*\..*/, "Please enter a valid email address"],
    },
    password: { type: String, minlength: 8 },
    registerType: {
      type: String,
      enum: ["normal", "google"],
      default: "normal",
    },
    socialId: { type: String },
    birth: { type: Date },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.password && this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

// 677208580c8186fa37a504cd
