import { Request, Response } from "express";
import user_model from "../models/user.model";
import bcrypt from "bcrypt";
import config from "../configs/env.config";
import jwt from "jsonwebtoken";

// Signup controller
const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, type, password, role } = req.body;
    if (!name || !email || !type || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing_user = await user_model.findOne({ email });
    if (existing_user) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hash_password = await bcrypt.hash(password, 10);
    const new_user = await user_model.create({
      name,
      email,
      type,
      role,
      password: hash_password,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: new_user });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Login controller
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const find_user = await user_model.findOne({ email });
    if (!find_user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validate_password = await bcrypt.compare(
      password,
      find_user.password
    );
    if (!validate_password) {
      return res.status(401).json({ message: "Wrong password, try again" });
    }
    const token_secret = config.jwt_secret;
    if (!token_secret) {
      return res.status(500).json({ message: "Token secret is not defined" });
    }
    const token = await jwt.sign(
      { id: find_user._id, role: find_user.role },
      token_secret,
      { expiresIn: "1d" }
    );
    return res
      .status(200)
      .json({ message: "Login successful", user: find_user, token });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Edit user controller
const editUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, email, new_password, retype_password } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // sign the update object
    const new_user: any = {};

    // assign new values to the update object
    if (name) new_user.name = name;

    // check if email is already in use by another user
    if (email) {
      const email_exists = await user_model.findOne({ email });
      if (email_exists && email_exists._id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
      new_user.email = email;
    }

    // if password is to be updated, check if it matches retype_password
    if (new_password) {
      if (new_password !== retype_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      new_user.password = await bcrypt.hash(new_password, 10);
    }

    // check if at least one field is provided
    if (Object.keys(new_user).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // update the user
    const updatedUser = await user_model.findByIdAndUpdate(userId, new_user, {
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

export { signup, login, editUser };
