import { Request, Response } from "express";
import user_model from "../models/user.model";
import bcrypt from "bcrypt";
import config from "../configs/env.config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface UserPayload {
  id: string;
}
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Signup controller ----------------------------------------------------->
const signup = async (req: Request, res: Response) => {
  try {
    const { username, fullname, email, password, retypePassword, role } =
      req.body;
    if (
      !username ||
      !fullname ||
      !email ||
      !password ||
      !retypePassword ||
      !role
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      username.length > 20 ||
      username.length < 3 ||
      fullname.length > 20 ||
      fullname.length < 3
    ) {
      return res.status(400).json({
        message: "Username and Fullname must have 3 to 20 characters",
      });
    }
    const normalised = {
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      role: role.toLowerCase().trim(),
    };

    const [count, emailUser, usernameUser] = await Promise.all([
      normalised.role === "admin"
        ? user_model.countDocuments({ role: "admin" })
        : 0,
      user_model.findOne({ email: normalised.email }),
      user_model.findOne({
        username: normalised.username,
      }),
    ]);

    if (normalised.role === "admin" && count >= 1) {
      return res.status(403).json({ message: "Admin role already exists" });
    }

    if (emailUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (usernameUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    if (password !== retypePassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new user_model({
      username: normalised.username,
      fullname,
      email: normalised.email,
      role: normalised.role,
      password: hashPassword,
    });

    await newUser.save();

    const { password: _, __v: __, ...safeUser } = newUser.toObject();
    res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Login controller ----------------------------------------------------->
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const normalisedEmail = email.toLowerCase().trim();
    const findUser = await user_model.findOne({ email: normalisedEmail });
    if (!findUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const validatePassword = await bcrypt.compare(password, findUser.password);
    if (!validatePassword) {
      return res.status(401).json({ message: "Wrong password, try again" });
    }

    const tokenSecret = config.JWT_SECRET;
    if (!tokenSecret) {
      return res.status(500).json({ message: "Token secret is not defined" });
    }
    const token = jwt.sign(
      { id: findUser.id, role: findUser.role },
      tokenSecret,
      { expiresIn: "1d" },
    );

    const { password: _, __v: __, ...safeUser } = findUser.toObject();
    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Edit user controller ----------------------------------------------------->
const editUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, fullname, email, password, retypePassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID in JWT" });
    }
    const normalised = {
      username: username ? username.toLowerCase().trim() : undefined,
      email: email ? email.toLowerCase().trim() : undefined,
    };

    const newUser: any = {};

    if (username) {
      const usernameExists = await user_model.findOne({
        username: normalised.username,
      });
      if (usernameExists && usernameExists.id.toString() !== userId) {
        return res.status(409).json({ message: "Username already in use" });
      }
      newUser.username = normalised.username;
    }

    if (fullname) newUser.fullname = fullname;

    if (email) {
      const emailExists = await user_model.findOne({
        email: normalised.email,
      });
      if (emailExists && emailExists.id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
      newUser.email = normalised.email;
    }

    if (password) {
      if (password !== retypePassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      newUser.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(newUser).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await user_model.findByIdAndUpdate(userId, newUser, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Delete user controller ----------------------------------------------------->
const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId || !mongoose.isValidObjectId(userId))
      return res.status(400).json({ message: "Provide a valid user ID" });

    const deletedUser = await user_model.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// delete all users controller ----------------------------------------------------->
const deleteAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await user_model.deleteMany({});
    return res.status(200).json({
      message: "All users deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// logout controller ----------------------------------------------------->
const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// getAllUsers controller ----------------------------------------------------->
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await user_model.find().select("-password -__v");
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export {
  signup,
  login,
  editUser,
  deleteUser,
  deleteAllUsers,
  logout,
  getAllUsers,
};
