import { Router } from "express";
const router = Router();

import {
  validateRequest,
  courseValidationRules,
} from "../middlewares/validationCheck.middleware.js";

import {
  createCourse,
  editCourse,
  getCourses,
  getSpecificCourse,
  deleteSpecificCourse,
  deleteAllCourses,
  filterCourses,
} from "../controllers/course.controller.js";

import { authentication } from "../middlewares/auth.middleware.js";

//Get Requests
router.get("/courses", authentication, getCourses);
router.get("/course/:id", authentication, getSpecificCourse);
router.get("/courses/filter", authentication, filterCourses);

//Post Requests
router.post(
  "/create-course",
  authentication,
  courseValidationRules,
  validateRequest,
  createCourse
);

//Put Requests
router.put(
  "/edit/course/:id",
  authentication,
  courseValidationRules,
  validateRequest,
  editCourse
);

//delete Requests
router.delete("/delete/course/:id", authentication, deleteSpecificCourse);
router.delete("/delete/courses", authentication, deleteAllCourses);

export default router;
