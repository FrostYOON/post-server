import express from "express";
import routes from "./routes/api/v1/index.js";
import viewRouter from "./routes/view/index.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
// app.use(
//   session({
//     secret: "hello world",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: "mongodb://localhost:27017/mongoose-repeat",
//     }),
//   })
// );
// app.use(passport.authenticate("session"));
app.use((req, res, next) => {
  if (!req.cookies["token"]) {
    return next();
  }
  passport.authenticate("jwt", { session: false })(req, res, next);
});

app.set("views", "./src/views");
app.set("view engine", "pug");

app.use("/api/v1", routes);
app.use("/", viewRouter);

export default app;
