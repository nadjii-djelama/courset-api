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
import { roleBasedAuth } from "../middlewares/roleBasedAuth.middleware.js";

//Get Requests
router.get(
  "/courses",
  authentication,
  roleBasedAuth(["admin", "student", "teacher", "guest"]),
  getCourses
);
router.get(
  "/course/:id",
  authentication,
  roleBasedAuth(["admin", "student", "teacher", "guest"]),
  getSpecificCourse
);
router.get(
  "/courses/filter",
  authentication,
  roleBasedAuth(["admin", "student", "teacher", "guest"]),
  filterCourses
);

//Post Requests
router.post(
  "/create-course",
  authentication,
  roleBasedAuth(["teacher"]),
  courseValidationRules,
  validateRequest,
  createCourse
);

//Put Requests
router.put(
  "/edit/course/:id",
  authentication,
  roleBasedAuth(["teacher"]),
  courseValidationRules,
  validateRequest,
  editCourse
);

//delete Requests
router.delete(
  "/delete/course/:id",
  authentication,
  roleBasedAuth(["admin", "teacher"]),
  deleteSpecificCourse
);
router.delete(
  "/delete/courses",
  authentication,
  roleBasedAuth(["teacher"]),
  deleteAllCourses
);

export default router;
