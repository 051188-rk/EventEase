import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  password: { type: String }, // not required for Google users
  profilePic: { type: String, default: "" },
  googleId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model("User", userSchema); 