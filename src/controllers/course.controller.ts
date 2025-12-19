import { Request, Response } from "express";
import course_model from "../models/course.model";

// Create a course
const createCourse = async (req: Request, res: Response) => {
  try {
    const create_course = await course_model.create(req.body);
    return res
      .status(201)
      .json({ message: "Course created sucessfully", course: create_course });
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export { createCourse };
