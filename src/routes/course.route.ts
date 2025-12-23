import { Router } from "express";
const router = Router();

import {
  validateRequest,
  courseValidationRules,
} from "../middlewares/validationCheck.middleware";

import { createCourse } from "../controllers/course.controller";

router.post("/course", courseValidationRules, validateRequest, createCourse);
