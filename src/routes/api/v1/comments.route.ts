import express, { Request, Response } from "express";
import Comment from "../../../models/comments";
import Post from "../../../models/posts";
import User from "../../../models/users";
import { isCommentValidator, isSameUserValidator } from "../../../validators/comment.validator";

const router = express.Router({ mergeParams: true });

// comment 생성
router.post("/", isCommentValidator, async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;
  const { postId } = req.params;

  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const commentCreated = await Comment.create({
      content,
      author: user._id,
      post: post._id,
    });
    if (!commentCreated) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    
    post.comments.push(commentCreated.id);
    await post.save();

    user.comments.push(commentCreated.id);
    await user.save();

    // res.status(201).json(commentCreated);
    res.redirect(`/posts/${postId}`);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

// comment 조회
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({
      post: postId,
    })
      .populate("author", "username")
      .populate("post", "title");
    
    res.status(200).json(comments);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

// comment 상세조회
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id, postId } = req.params;
  try {
    const comment = await Comment.findOne({ 
      _id: id,
      post: postId 
    }).populate("author", "username")
      .populate("post", "title");

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    res.status(200).json(comment);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

// comment 수정
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id, postId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }

  try {
    const updateComment = await Comment.findOneAndUpdate(
      { 
        _id: id,
        post: postId
      },
      { content },
      { returnDocument: "after" } // 업데이트된 데이터 반환
    ).populate("author", "username")
    .populate("post", "title");

    if (!updateComment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    res.status(200).json(updateComment);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

// comment 삭제
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id, postId } = req.params;
  
  try {
    console.log('Attempting to delete comment:', { id, postId }); // 디버깅용 로그

    const deleteComment = await Comment.findOneAndDelete({
      _id: id,
      post: postId
    });

    console.log('Found comment:', deleteComment); // 디버깅용 로그

    if (!deleteComment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Post에서 댓글 ID 제거
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: id } }
    );

    // User에서 댓글 ID 제거
    await User.findByIdAndUpdate(
      deleteComment.author,
      { $pull: { comments: id } }
    );

    res.status(204).send();
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.post("/:commentId/edit", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  const { commentId, postId } = req.params;
  const { content } = req.body;
  try {
    const updateComment = await Comment.findOneAndUpdate(
      { 
        _id: commentId,
        post: postId
      },
      { content },
    ).populate("author", "username")
    .populate("post", "title");

    if (!updateComment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
    // res.status(200).json(updateComment);
    res.redirect(`/posts/${postId}`);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.get("/:commentId/delete", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  const { commentId, postId } = req.params;
  
  try {
    const deleteComment = await Comment.findOneAndDelete({
      _id: commentId,
      post: postId
    });

    if (!deleteComment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Post에서 댓글 ID 제거
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: commentId } }
    );

    // User에서 댓글 ID 제거
    await User.findByIdAndUpdate(
      deleteComment.author,
      { $pull: { comments: commentId } }
    );

    res.redirect(`/posts/${postId}`);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

export default router;
