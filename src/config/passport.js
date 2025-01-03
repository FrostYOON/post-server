import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/users.js";

const config = {
  usernameField: "email",
  passwordField: "password",
};

passport.use(
  new LocalStrategy(config, async function (email, password, done) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const compareResult = await bcrypt.compare(password, user.password);
      if (!compareResult) {
        return done(null, false, { message: "Invalid password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  })
);

// response에 Cookie를 실어줄 때 동작
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// request에서 Cookie를 읽어올 때 동작
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
