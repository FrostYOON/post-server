import Post from "../models/posts";
import { Request, Response, NextFunction } from "express";

export const isUserValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(403).send("Not Authorized");
    return;
  }
  next();
};

export const isSameUserValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(403).send("Not Authorized");
    return;
  }

  const post = await Post.findById(req.params.postId);
  if (!post?.author?._id.equals(user._id)) {
    res.status(403).send("Not Authorized");
    return;
  }
  next();
};
