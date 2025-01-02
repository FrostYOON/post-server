import express from "express";
import postsRouter from "./posts.route.js";
import commentsRouter from "./comments.route.js";
import usersRouter from "./users.route.js";

const router = express.Router();

router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/users", usersRouter);

export default router;
