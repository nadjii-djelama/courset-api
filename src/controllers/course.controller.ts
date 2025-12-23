import { Request, Response } from "express";
import course_model from "../models/course.model";

// Create a course controller ----------------------------------------------------->
const createCourse = async (req: Request, res: Response) => {
  try {
    // Create new course from validated request body
    const course = await course_model.create(req.body);

    // Return created course with 201 status
    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err: any) {
    // Handle validation errors and server issues
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

    // Update course with validated request body
    const updatedCourse = await course_model.findByIdAndUpdate(
      courseId,
      req.body,
      { new: true } // Return updated document
    );

    // Return 404 if course doesn't exist
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return updated course
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
    // Fetch all courses from database
    const courses = await course_model.find();

    // Handle empty collection gracefully
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

    // Fetch single course by ID
    const course = await course_model.findById(courseId);

    // Return 404 if course not found
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return specific course
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

    // Delete course and return deleted document
    const deletedCourse = await course_model.findByIdAndDelete(courseId);

    // Return 404 if course not found
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return success confirmation
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
    // Delete all courses from collection
    const result = await course_model.deleteMany({});

    // Return delete confirmation with count
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
      const prices: any = Array.isArray(price) ? price : [price];
      if (prices.length === 1) {
        query.price = prices[0]; // Exact price match
      } else {
        // Price range: min <= price <= max
        query.price = {
          $gte: Number(Math.min(...prices)),
          $lte: Number(Math.max(...prices)),
        };
      }
    }

    // Add other filters
    if (category) addFilter("category", category as string);
    if (level) addFilter("level", level as string);
    if (author) addFilter("author", author as string);

    // Get total count of filtered results
    const total = await course_model.countDocuments(query);

    // Fetch paginated, sorted, filtered courses
    const courses = await course_model
      .find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Return filtered results with pagination info
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
