import { Request, Response } from "express";
import course_model from "../models/course.model.js";

interface UserPayload {
  id: string;
}
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Create a course controller ----------------------------------------------------->
const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authorId = req.user?.id;
    const course = await course_model.create({ ...req.body, author: authorId });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Edit course controller ----------------------------------------------------->
const editCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;

    const updatedCourse = await course_model.findByIdAndUpdate(
      courseId,
      req.body,
      { new: true },
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};
// Get all courses controller ----------------------------------------------------->
const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await course_model.find();

    if (courses.length <= 0) {
      return res.status(200).json({ message: "No courses found" });
    }

    // Return courses with count
    return res.status(200).json({
      message: "Courses fetched successfully",
      courses,
      count: courses.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Get specific course controller ----------------------------------------------------->
const getSpecificCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;

    const course = await course_model.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course fetched successfully",
      course,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete specific course controller ----------------------------------------------------->
const deleteSpecificCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;

    const deletedCourse = await course_model.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete all courses controller ----------------------------------------------------->
const deleteAllCourses = async (req: Request, res: Response) => {
  try {
    const result = await course_model.deleteMany({});

    return res.status(200).json({
      message: "All courses deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Filter courses controller ----------------------------------------------------->
const filterCourses = async (req: Request, res: Response) => {
  try {
    const {
      price,
      category,
      level,
      author,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    // Calculate pagination offset
    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {};

    // Helper function for multi-value filters ($in operator)
    const addFilter = (field: string, values: string | string[]) => {
      const vals = Array.isArray(values) ? values : [values];
      if (vals.length === 1) {
        query[field] = vals[0]; // Exact match
      } else {
        query[field] = { $in: vals }; // OR logic for multiple values
      }
    };

    // Handle price filtering (exact or range)
    if (price) {
      let prices: number[];

      if (Array.isArray(price)) {
        prices = price.map((p) => Number(p)).filter((p) => !isNaN(p));
      } else {
        // Split "10,20" → ["10", "20"] → [10, 20]
        prices = String(price)
          .split(",")
          .map((p) => Number(p.trim()))
          .filter((p) => !isNaN(p));
      }

      // Need valid min/max range
      if (prices.length >= 2) {
        query.price = {
          $gte: Math.min(...prices),
          $lte: Math.max(...prices),
        };
      }
    }

    if (category) addFilter("category", category as string);
    if (level) addFilter("level", level as string);
    if (author) addFilter("author", author as string);

    const total = await course_model.countDocuments(query);

    const courses = await course_model
      .find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      message: "Courses filtered successfully",
      courses,
      count: courses.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export {
  createCourse,
  editCourse,
  getCourses,
  getSpecificCourse,
  deleteSpecificCourse,
  deleteAllCourses,
  filterCourses,
};
