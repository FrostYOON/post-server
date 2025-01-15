import express, { Request, Response } from "express";
import Post from "../../../models/posts";
import User from "../../../models/users";
import Comment from "../../../models/comments";
import commentsRouter from "./comments.route";
import { isSameUserValidator } from "../../../validators/post.validator";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const post = await Post.create({ title, content, author: user._id });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    user.posts.push(post.id);
    await user.save();
    // res.status(201).json(post);
    res.redirect("/posts");
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { title } = req.query;
  try {
    const posts = await Post.find({
      // title: { $regex: `.*${title}.*`, $options: "i" },
    });
    res.status(200).json(posts);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.get("/:postId", async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    res.status(200).json(post);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.put("/:postId", async (req: Request, res: Response): Promise<void> => {
  const { title, content } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        title,
        content,
      },
      { returnDocument: "after" }
    );
    res.status(200).json(updatedPost);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.delete("/:postId", async (req: Request, res: Response): Promise<void> => {
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);
    if (!deletePost) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    await User.findByIdAndUpdate(deletePost.author, {
      $pull: { posts: deletePost._id },
    });

    await Comment.deleteMany({ post: deletePost._id });

    res.status(204).json({ message: "Post deleted" });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.post("/:postId/edit", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  const { title, content } = req.body;
  try {
    await Post.findByIdAndUpdate(req.params.postId, {
      title,
      content,
    });
    // res.status(200).json(updatedPost);
    res.redirect(`/posts/${req.params.postId}`);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.get("/:postId/delete", isSameUserValidator, async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);
    if (!deletePost) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    await User.findByIdAndUpdate(deletePost.author, {
      $pull: { posts: deletePost._id },
    });
    await Comment.deleteMany({ post: deletePost._id });
    res.redirect("/posts");
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.use("/:postId/comments", commentsRouter);

export default router;
