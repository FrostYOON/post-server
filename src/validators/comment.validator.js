import Comment from "../models/comments.js";

export const isCommentValidator = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isSameUserValidator = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("author")
      .populate("post");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!comment.author || !comment.author._id.equals(user._id)) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    req.comment = comment;  // 나중에 사용할 수 있도록 request 객체에 저장
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
