import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
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

UserSchema.pre("save", function (next) {
  if (this.password && this.isNew || this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;

// 677208580c8186fa37a504cd
