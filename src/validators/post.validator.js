import Post from "../models/posts.js";

export const isUserValidator = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    res.status(403).send("Not Authorized");
  }
  next();
};

export const isSameUserValidator = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    res.status(403).send("Not Authorized");
  }

  const post = await Post.findById(req.params.postId);
  if (!post.author._id.equals(user._id)) {
    res.status(403).send("Not Authorized");
  }
  next();
};
