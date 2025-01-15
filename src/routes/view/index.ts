import express from "express";
import postRouter from "./posts.view.route";
import userRouter from "./users.view.route";
import commentRouter from "./comments.view.route";

const router = express.Router();

router.use("/posts", postRouter);
router.use("/users", userRouter);
router.use("/comments", commentRouter);

export default router;
