import express, { Request, Response } from "express";
import Comment from "../../models/comments";
import { isSameUserValidator } from "../../validators/comment.validator";

const router = express.Router();

router.get("/:commentId/edit", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("author")
      .populate("post");
    
    if (!comment) {
      res.status(404).send("Comment not found");
      return;
    }
    
    res.render("commentEdit", { comment });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(err);
    res.status(500).send("Internal Server Error");
    return;
  }
});

router.get("/:commentId/delete", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate("post");
    if (!comment) {
      res.status(404).send("Comment not found");
      return;
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/posts/${comment.post._id}`);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).send("Internal Server Error");
    return;
  }
});

export default router;
