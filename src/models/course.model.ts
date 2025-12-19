import mongoose, { Types } from "mongoose";

const course_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 100,
    },
    description: {
      type: String,
      required: true,
      minLength: 50,
      maxLength: 300,
    },
    thumbnail: {
      type: Buffer,
      required: false,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "sport",
        "technology",
        "cooking",
        "business",
        "finance",
        "design",
        "marketing",
        "lifestyle",
        "health",
        "music",
        "other",
      ],
      default: "other",
    },
    reviews: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    payment_system: {
      type: String,
      enum: ["usdt", "credit card", "paypal", "bank transfer"],
      default: "paypal",
      required: true,
    },
    coupon_code: {
      type: String,
      maxLength: 15,
      minLength: 3,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    language: {
      type: [String],
      required: true,
      enum: ["en", "fr", "gr", "es", "it", "id", "jp", "ch", "rs"],
      default: ["en"],
      validate: {
        validator: function (v: String[]) {
          return v && v.length >= 1;
        },
        message: "At least one language is required",
      },
    },
    requirements: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: String[]) {
          return v && v.length >= 1;
        },
        message: "At least one requirement is required",
      },
    },
    sections: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: String[]) {
          return v && v.length >= 2;
        },
        message: "At least two section is required",
      },
    },
  },
  { timestamps: true }
);

const course_model = mongoose.model("Course", course_schema);

export default course_model;
