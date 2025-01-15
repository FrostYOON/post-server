import express from "express";
import User from "../../models/users";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("userSignup");
});

router.get("/login", (req, res) => {
  res.render("userLogin");
});

router.get("/logout", (req, res) => {
  // req.session.destroy((err) => {
  //   if (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "session destroy error" });
  //   }
  // });
  res.clearCookie("token");
  res.redirect("/users/login");
});

router.get("/posts", async (req, res) => {
  const user = req.user;
  if (user) {
    const findUser = await User.findById(user._id).populate("posts");
    if (!findUser) {
      res.send("Not Authorized");
      return;
    }
    res.render("myPosts", { findUser, user });
  } else {
    res.send("Not Authorized");
    return;
  }
});

export default router;
