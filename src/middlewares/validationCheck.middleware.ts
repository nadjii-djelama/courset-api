import { body, validationResult } from "express-validator";
import { Response, Request, NextFunction } from "express";

// Validation rules
const courseValidationRules = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("description")
    .isLength({ min: 50, max: 300 })
    .withMessage("Description must be between 50-300 characters"),
  body("category")
    .isIn([
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
    ])
    .withMessage("Invalid category"),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),
  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid level"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1"),
  body("language")
    .isArray({ min: 1 })
    .withMessage("At least one language is required"),
  body("requirements")
    .isArray({ min: 1 })
    .withMessage("At least one requirement is required"),
  body("sections")
    .isArray({ min: 2 })
    .withMessage("At least two sections are required"),
];

// Middleware to check validation results
const validateRequest = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => err.msg),
    });
  }
  next();
};

export { courseValidationRules, validateRequest };
