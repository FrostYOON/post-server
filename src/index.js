import mongoose from "mongoose";
import app from "./app.js";
import "./config/passport.js";

mongoose.connect("mongodb://localhost:27017/mongoose-repeat").then(() => {
  console.log("Connected to MongoDB");
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
