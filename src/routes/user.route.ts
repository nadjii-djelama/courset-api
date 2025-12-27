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

router.get("/users", getAllUsers);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/edit-info", editUser);

router.delete("/delete/:id", deleteUser);
router.delete("/delete-all", deleteAllUsers);

export default router;
