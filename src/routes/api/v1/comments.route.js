import express from "express";
import Comment from "../../../models/comments.js";
import Post from "../../../models/posts.js";

const router = express.Router({ mergeParams: true });

// comment 생성
router.post("/", async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const user = req.user;  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentCreated = await Comment.create({
      content,
      author: user._id,
      post: post._id,
    });

    post.comments.push(commentCreated._id);
    await post.save();

    user.comments.push(commentCreated._id);
    await user.save();

    // res.status(201).json(commentCreated);
    res.redirect(`/posts/${postId}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// comment 조회
router.get("/", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({
      post: postId,
    })
      .populate("author", "username")
      .populate("post", "title");
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// comment 상세조회
router.get("/:id", async (req, res) => {
  const { id, postId } = req.params;
  try {
    const comment = await Comment.findOne({ 
      _id: id,
      post: postId 
    }).populate("author", "username")
      .populate("post", "title");

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// comment 수정
router.put("/:id", async (req, res) => {
  const { id, postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Invalid request" });
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
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(updateComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// comment 삭제
router.delete("/:id", async (req, res) => {
  const { id, postId } = req.params;
  
  try {
    console.log('Attempting to delete comment:', { id, postId }); // 디버깅용 로그

    const deleteComment = await Comment.findOneAndDelete({
      _id: id,
      post: postId
    });

    console.log('Found comment:', deleteComment); // 디버깅용 로그

    if (!deleteComment) {
      return res.status(404).json({ message: "Comment not found" });
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
