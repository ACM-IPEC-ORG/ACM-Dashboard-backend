import mongoose from "mongoose";

const userShema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
});

export const User= new mongoose.model("User", userShema);
