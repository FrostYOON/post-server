import express from "express";
import postsRouter from "./posts.route";
import commentsRouter from "./comments.route";
import usersRouter from "./users.route";

const router = express.Router();

router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/users", usersRouter);

export default router;
