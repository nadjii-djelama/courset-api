import mongoose from "mongoose";

const user_schema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 20 },
  email: { type: String, required: true },
  type: { type: String, required: true, enum: ["student", "teacher"] },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  password: { type: String, required: true },
});

const user_model = mongoose.model("User", user_schema);

export default user_model;
