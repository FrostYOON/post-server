import mongoose from "mongoose";
import app from "./app.js";
import "./config/passport.js";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("Connected to MongoDB");
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
