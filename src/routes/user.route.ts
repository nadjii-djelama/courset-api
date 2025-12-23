import { Router } from "express";

const router = Router();

import {
  signup,
  login,
  editUser,
  deleteUser,
  logout,
} from "../controllers/user.controller";

router.post("signup", signup);
router.post("login", login);
router.put("edit-info", editUser);
router.delete("delete", deleteUser);
router.post("logout", logout);

export default router;
