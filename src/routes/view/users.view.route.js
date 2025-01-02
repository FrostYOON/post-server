import express from "express";
import User from "../../models/users.js";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("userSignup");
});

router.get("/login", (req, res) => {
  res.render("userLogin");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "session destroy error" });
    }
  });
  res.clearCookie("connect.sid");
  res.redirect("/posts");
});

export default router;
