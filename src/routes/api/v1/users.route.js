import express from "express";
import User from "../../../models/users.js";
import passport from "../../../config/passport.js";

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
    successReturnToOrRedirect: "/posts",
    failureMessage: true,
    failureRedirect: "/users/login",
  })
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
