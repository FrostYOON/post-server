import express from "express";
import Comment from "../../models/comments.js";
import { isSameUserValidator } from "../../validators/comment.validator.js";

const router = express.Router();

router.get("/:commentId/edit", isSameUserValidator, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate("author")
      .populate("post");
    
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    
    res.render("commentEdit", { comment });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:commentId/delete", isSameUserValidator, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate("post");
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.redirect(`/posts/${comment.post._id}`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
