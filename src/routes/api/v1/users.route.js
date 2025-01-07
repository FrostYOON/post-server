import express from "express";
import User from "../../../models/users.js";
import passport from "../../../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const signupValidator = async (req, res, next) => {
  const { username, password, email, confirmPassword, birth } = req.body;
  if (!username || !password || !email || !confirmPassword || !birth) {
    return res.status(400).json({ message: "Invalid request" });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password do not match" });
  }

  const emailRegex = new RegExp(/.*\@.*\..*/);
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }

  next();
};

router.post("/signup", signupValidator, async (req, res) => {
  const { username, password, email, birth } = req.body;
  try {
    const user = await User.create({
      username,
      password,
      email,
      birth,
    });
    // res.status(201).json(user);
    res.redirect("/posts");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    // successReturnToOrRedirect: "/posts",
    failureMessage: true,
    session: false,
  }),
  (req, res) => {
    let token = null;
    if (req.user) {
      const { _id } = req.user;
      const payload = { _id };
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    }
    res.cookie("token", token);
    res.redirect("/posts");
  }
);

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/posts",
    session: false,
  }),
  (req, res) => {
    let token = null;
    if (req.user) {
      const { _id } = req.user;
      const payload = { _id };
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
    }
    res.cookie("token", token);
    res.redirect("/posts");
  }
);

router.delete("/", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.query.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
