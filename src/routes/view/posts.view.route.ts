import express from "express";
import Post from "../../models/posts";
import { isUserValidator, isSameUserValidator } from "../../validators/post.validator";

const router = express.Router();

router.get("/create", isUserValidator, async (req, res) => {
  const user = req.user;
  res.render("postCreate", { user });
});

router.get("/", async (req, res) => {
  const user = req.user;
  const page: number = Number(req.query.page) || 1;
  const size: number = Number(req.query.size) || 5;
  const skip: number = (page - 1) * size;
  try {
    const posts = await Post.find({})
      .populate("author", "username")
      .populate("comments", "content")
      .skip(skip)
      .limit(size);
    res.render("posts", { posts, page, size, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:postId", isUserValidator, async (req, res) => {
  try {
    const user = req.user;
    const post = await Post.findById(req.params.postId)
      .populate("author")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username",
        },
      });
    let isSameUser = false;
    if (post?.author?._id.equals(user?._id)) {
      isSameUser = true;
    }
    res.render("post", { post, isSameUser });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:postId/edit", isSameUserValidator, async (req, res) => {
  try {
    const user = req.user;
    const post = await Post.findById(req.params.postId);
    res.render("postEdit", { post, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:postId/delete", isSameUserValidator, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.redirect("/posts");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
