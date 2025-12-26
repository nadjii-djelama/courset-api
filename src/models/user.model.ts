import mongoose from "mongoose";

const user_schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxLength: 20,
    lowercase: true,
    index: true,
    unique: true,
  },
  fullname: { type: String, required: true, maxLength: 20 },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["student", "teacher", "guest", "admin"],
    default: "guest",
    lowercase: true,
  },
  password: { type: String, required: true },
});

const user_model = mongoose.model("User", user_schema);

export default user_model;
