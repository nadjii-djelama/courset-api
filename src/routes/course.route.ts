import { Router } from "express";
const router = Router();

import {
  validateRequest,
  courseValidationRules,
} from "../middlewares/validationCheck.middleware";

import {
  createCourse,
  editCourse,
  getCourses,
  getSpecificCourse,
  deleteSpecificCourse,
  deleteAllCourses,
  filterCourses,
} from "../controllers/course.controller";

//Get Requests
router.get("/courses", getCourses);
router.get("/course/:id", getSpecificCourse);
router.get("/courses/filter", filterCourses);

//Post Requests
router.post(
  "/create-course",
  courseValidationRules,
  validateRequest,
  createCourse
);

//Put Requests
router.put(
  "/edit/course/:id",
  courseValidationRules,
  validateRequest,
  editCourse
);

//delete Requests
router.delete("/delete/course/:id", deleteSpecificCourse);
router.delete("/delete/courses", deleteAllCourses);
