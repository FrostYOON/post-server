import express from "express";
import Post from "../../models/posts.js";

const router = express.Router();

router.get("/create", async (req, res) => {
  const user = req.user;
  res.render("postCreate", { user });
});

router.get("/", async (req, res) => {
  const user = req.user;

  const page = req.query.page || 1;
  const size = req.query.size || 5;
  const skip = (page - 1) * size;
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

router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username",
        },
      });
    res.render("post", { post });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
