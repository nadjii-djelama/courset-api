import { Request, Response } from "express";
import user_model from "../models/user.model.js";
import bcrypt from "bcrypt";
import config from "../configs/env.config.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Signup controller ----------------------------------------------------->
const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, type, password, role } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !type || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists by email
    const existing_user = await user_model.findOne({ email });
    if (existing_user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash_password = await bcrypt.hash(password, 10);

    // Create the new user
    const new_user = await user_model.create({
      name,
      email,
      type,
      role,
      password: hash_password,
    });

    // Success response
    res
      .status(201)
      .json({ message: "User created successfully", user: new_user });
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
    const find_user = await user_model.findOne({ email });
    if (!find_user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the password
    const validate_password = await bcrypt.compare(
      password,
      find_user.password
    );
    if (!validate_password) {
      return res.status(401).json({ message: "Wrong password, try again" });
    }

    // Generate JWT token
    const token_secret = config.jwt_secret;
    if (!token_secret) {
      return res.status(500).json({ message: "Token secret is not defined" });
    }
    const token = jwt.sign(
      { id: find_user._id, role: find_user.role },
      token_secret,
      { expiresIn: "1d" }
    );

    // Success response
    return res
      .status(200)
      .json({ message: "Login successful", user: find_user, token });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Edit user controller ----------------------------------------------------->
const editUser = async (req: Request, res: Response) => {
  try {
    const user_id = req.params.id;
    const { name, email, new_password, retype_password } = req.body;

    // Check if user_id is provided and is a valid ObjectId
    if (!user_id || !mongoose.isValidObjectId(user_id)) {
      return res.status(400).json({ message: "Provide a valid user ID" });
    }

    // Build the update object
    const new_user: any = {};

    // Assign new values to the update object
    if (name) new_user.name = name;

    // Check if email is already in use by another user
    if (email) {
      const email_exists = await user_model.findOne({ email });
      if (email_exists && email_exists._id.toString() !== user_id) {
        return res.status(409).json({ message: "Email already in use" });
      }
      new_user.email = email;
    }

    // Hash the new password if provided
    if (new_password) {
      if (new_password !== retype_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      new_user.password = await bcrypt.hash(new_password, 10);
    }

    // Check if at least one field is provided
    if (Object.keys(new_user).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Update the user
    const updatedUser = await user_model.findByIdAndUpdate(user_id, new_user, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Success response
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
    const user_id = req.params.id;

    // Check if user_id is provided and is a valid ObjectId
    if (!user_id || !mongoose.isValidObjectId(user_id))
      return res.status(400).json({ message: "Provide a valid user ID" });

    // Delete the user
    const deleted_user = await user_model.findByIdAndDelete(user_id);
    if (!deleted_user)
      return res.status(404).json({ message: "User not found" });

    // Success response
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
};

// Logout controller
const logout = async (req: Request, res: Response) => {
  try {
    // Clear the JWT token cookie (client-side invalidation)
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.node_env === "production",
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
