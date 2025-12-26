import { Request, Response } from "express";
import usermodel from "../models/user.model.js";
import bcrypt from "bcrypt";
import config from "../configs/env.config.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Signup controller ----------------------------------------------------->
const signup = async (req: Request, res: Response) => {
  try {
    const { username, fullname, email, password, role } = req.body;

    // Check if all required fields are provided
    if (!username || !fullname || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists by email

    const emailUser = await usermodel.findOne({ email });
    if (emailUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Check username second
    const usernameUser = await usermodel.findOne({ username });
    if (usernameUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await new usermodel({
      username,
      fullname,
      email,
      role,
      password: hashPassword,
    }).save();

    // Success response
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

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists by email
    const findUser = await usermodel.findOne({ email });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the password
    const validatePassword = await bcrypt.compare(password, findUser.password);
    if (!validatePassword) {
      return res.status(401).json({ message: "Wrong password, try again" });
    }

    // Generate JWT token
    const tokenSecret = config.JWT_SECRET;
    if (!tokenSecret) {
      return res.status(500).json({ message: "Token secret is not defined" });
    }
    const token = jwt.sign(
      { id: findUser.id, role: findUser.role },
      tokenSecret,
      { expiresIn: "1d" }
    );

    // Success response
    const { password: _, __v: __, ...safeUser } = findUser.toObject();
    return res.status(200).json({
      message: "Login successful",
      user: safeUser, // ✅ Clean TypeScript
      token,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Edit user controller ----------------------------------------------------->
const editUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, fullname, email, newPassword, retypePassword } = req.body;

    // Check if userId is provided and is a valid ObjectId
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Provide a valid user ID" });
    }

    // Build the update object
    const newUser: any = {};

    // Check if username is already in use by another user
    if (username) {
      const usernameExists = await usermodel.findOne({ username });
      if (usernameExists && usernameExists.id.toString() !== userId) {
        return res.status(409).json({ message: "Username already in use" });
      }
      newUser.username = username;
    }

    if (fullname) newUser.fullname = fullname;

    // Check if email is already in use by another user
    if (email) {
      const emailExists = await usermodel.findOne({ email });
      if (emailExists && emailExists.id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
      newUser.email = email;
    }

    // Hash the new password if provided
    if (newPassword) {
      if (newPassword !== retypePassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      newUser.password = await bcrypt.hash(newPassword, 10);
    }

    // Check if at least one field is provided
    if (Object.keys(newUser).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Update the user
    const updatedUser = await usermodel.findByIdAndUpdate(userId, newUser, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Success response
    const { password: _, __v: __, ...safeUser } = updatedUser.toObject();
    return res
      .status(200)
      .json({ message: "User updated successfully", user: safeUser });
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

    // Check if userId is provided and is a valid ObjectId
    if (!userId || !mongoose.isValidObjectId(userId))
      return res.status(400).json({ message: "Provide a valid user ID" });

    // Delete the user
    const deletedUser = await usermodel.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    // Success response
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Logout controller
const logout = async (req: Request, res: Response) => {
  try {
    // Clear the JWT token cookie (client-side invalidation)
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
    // Success response
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export { signup, login, editUser, deleteUser, logout };
