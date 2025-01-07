import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/users.js";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

const config = {
  usernameField: "email",
  passwordField: "password",
};

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/v1/users/login/google/callback"
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

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}

const jwtOptions = {
  jwtFromRequest: (req) => {
    let token = null;
    if (req && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    return token;
  },
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (user, done) => {
    const foundUser = await User.findById(user._id);
    return done(null, foundUser);
  })
);

passport.use(
  new GoogleStrategy(
    googleOptions,
    async (accessToken, refreshToken, profile, done) => {
      try {
        const foundUser = await User.findOne({
          socialId: profile._json.sub,
          registerType: "google",
        });
        if (foundUser) {
          return done(null, foundUser);
        } else {
          const newUser = await User.create({
            email: profile._json.email,
            username: profile._json.name,
            socialId: profile._json.sub,
            registerType: "google",
          });
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// // response에 Cookie를 실어줄 때 동작
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// // request에서 Cookie를 읽어올 때 동작
// passport.deserializeUser(async function (id, done) {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

export default passport;
