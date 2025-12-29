import { Router } from "express";

const router = Router();

import {
  signup,
  login,
  editUser,
  deleteUser,
  deleteAllUsers,
  logout,
  getAllUsers,
} from "../controllers/user.controller.js";

import { authentication } from "../middlewares/auth.middleware.js";
import { roleBasedAuth } from "../middlewares/roleBasedAuth.middleware.js";

// GET Requests
router.get("/users", authentication, roleBasedAuth(["admin"]), getAllUsers);

// POST Requests
router.post("/signup", signup);
router.post("/login", login);
router.post(
  "/logout",
  authentication,
  roleBasedAuth(["admin", "student", "teacher"]),
  logout
);

// PUT Requests
router.put(
  "/edit-info",
  authentication,
  roleBasedAuth(["admin", "student", "teacher"]),
  editUser
);

// DELETE Requests
router.delete(
  "/delete/:id",
  authentication,
  roleBasedAuth(["admin"]),
  deleteUser
);
router.delete(
  "/delete-all",
  authentication,
  roleBasedAuth(["admin"]),
  deleteAllUsers
);
export default router;
