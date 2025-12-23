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

export {
  createCourse,
  editCourse,
  getCourses,
  getSpecificCourse,
  deleteSpecificCourse,
  deleteAllCourses,
  filterCourses,
};
