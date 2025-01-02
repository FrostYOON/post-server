import express from "express";
import postRouter from "./posts.view.route.js";
import userRouter from "./users.view.route.js";

const router = express.Router();

router.use("/posts", postRouter);
router.use("/users", userRouter);

export default router;
