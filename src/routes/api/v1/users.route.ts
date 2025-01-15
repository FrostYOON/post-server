import express, { Request, Response, NextFunction } from "express";
import User from "../../../models/users";
import passport from "../../../config/passport";
import jwt from "jsonwebtoken";

const router = express.Router();

const signupValidator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, password, email, confirmPassword, birth } = req.body;
  if (!username || !password || !email || !confirmPassword || !birth) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Password and confirm password do not match" });
    return;
  }

  const emailRegex = new RegExp(/.*\@.*\..*/);
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email" });
    return;
  }

  const user = await User.findOne({ email });
  if (user) {
    res.status(400).json({ message: "Email already exists" });
    return;
  }

  next();
};

router.post("/signup", signupValidator, async (req: Request, res: Response): Promise<void> => {
  const { username, password, email, birth } = req.body;
  try {
    const user = await User.create({
      username,
      password,
      email,
      birth,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    // res.status(201).json(user);
    res.redirect("/posts");
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    if (!users) {
      res.status(404).json({ message: "Users not found" });
      return;
    }
    res.status(200).json(users);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    // successReturnToOrRedirect: "/posts",
    failureMessage: true,
    session: false,
  }),
  (req: Request, res: Response): void=> {
    let token = null;
    if (req.user) {
      const { _id } = req.user;
      const payload = { _id };
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "");
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
      token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "");
    }
    res.cookie("token", token);
    res.redirect("/posts");
  }
);

router.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.query.id);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: err.message });
    return;
  }
});

export default router;
