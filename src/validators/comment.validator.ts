import Comment from "../models/comments";
import { Request, Response, NextFunction } from "express";
export const isCommentValidator = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};

export const isSameUserValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("author")
      .populate("post");

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (!comment.author || !comment.author._id.equals(user._id)) {
      res.status(403).json({ message: "Not Authorized" });
      return;
    }

    // req.comment = comment;  // 나중에 사용할 수 있도록 request 객체에 저장
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
