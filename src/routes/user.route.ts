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

router.get("/users", authentication, getAllUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/edit-info", authentication, editUser);

router.delete("/delete/:id", authentication, deleteUser);
router.delete("/delete-all", authentication, deleteAllUsers);
export default router;
