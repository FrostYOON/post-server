import express from "express";
import Post from "../../../models/posts.js";
import User from "../../../models/users.js";
import Comment from "../../../models/comments.js";
import commentsRouter from "./comments.route.js";
import { isSameUserValidator } from "../../../validators/post.validator.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;
    const post = await Post.create({ title, content, author: user._id });
    user.posts.push(post._id);
    await user.save();
    // res.status(201).json(post);
    res.redirect("/posts");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  const { title } = req.query;
  try {
    const posts = await Post.find({
      // title: { $regex: `.*${title}.*`, $options: "i" },
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:postId", async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);

    await User.findByIdAndUpdate(deletePost.author, {
      $pull: { posts: deletePost._id },
    });

    await Comment.deleteMany({ post: deletePost._id });

    res.status(204).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:postId/edit", isSameUserValidator, async (req, res) => {
  const { title, content } = req.body;
  try {
    await Post.findByIdAndUpdate(req.params.postId, {
      title,
      content,
    });
    // res.status(200).json(updatedPost);
    res.redirect(`/posts/${req.params.postId}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:postId/delete", isSameUserValidator, async (req, res) => {
  const user = req.user;
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);
    await User.findByIdAndUpdate(deletePost.author, {
      $pull: { posts: deletePost._id },
    });
    await Comment.deleteMany({ post: deletePost._id });
    res.redirect("/posts");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use("/:postId/comments", commentsRouter);

export default router;
