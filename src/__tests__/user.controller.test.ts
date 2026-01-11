import request from "supertest";
import bcrypt from "bcrypt";

// Mock config and connection modules that server.ts imports with .js extensions
jest.mock(
  "../configs/env.config.js",
  () => ({
    __esModule: true,
    default: { PORT: 0, JWT_SECRET: "testsecret", NODE_ENV: "test" },
  }),
  { virtual: true }
);
jest.mock(
  "../configs/db.config.js",
  () => ({ __esModule: true, default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "../configs/redis.config.js",
  () => ({ __esModule: true, redisServer: jest.fn() }),
  { virtual: true }
);

// Provide a minimal user.route that wires the controller handlers
jest.mock(
  "../routes/user.route.js",
  () => {
    const express = require("express");
    const router = express.Router();
    const ctrl = require("../controllers/user.controller");
    router.post("/signup", ctrl.signup);
    router.post("/login", ctrl.login);
    router.post("/logout", ctrl.logout);
    router.put("/edit-info", ctrl.editUser);
    router.get("/users", ctrl.getAllUsers);
    router.delete("/delete/:id", ctrl.deleteUser);
    router.delete("/delete-all", ctrl.deleteAllUsers);
    return { __esModule: true, default: router };
  },
  { virtual: true }
);

jest.mock(
  "../routes/course.route.js",
  () => {
    const express = require("express");
    const router = express.Router();
    return { __esModule: true, default: router };
  },
  { virtual: true }
);

// Create mocks for the user model static methods and instance
const mockFindOne = jest.fn();
const mockCountDocuments = jest.fn();

class MockUserModel {
  [key: string]: any;
  constructor(data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue({ ...data, id: "mockid" });
  }
  static findOne = mockFindOne;
  static countDocuments = mockCountDocuments;
}

jest.mock("../models/user.model", () => ({
  __esModule: true,
  default: MockUserModel,
}));

import app from "../server";

describe("User controller routes (supertest)", () => {
  beforeEach(() => {
    mockFindOne.mockReset();
    mockCountDocuments.mockReset();
  });

  test("POST /api/v1/signup - success", async () => {
    // No existing user by email or username
    mockFindOne.mockResolvedValue(null);
    mockCountDocuments.mockResolvedValue(0);

    const res = await request(app).post("/api/v1/signup").send({
      username: "testuser",
      fullname: "Test User",
      email: "test@example.com",
      password: "pass123",
      retypePassword: "pass123",
      role: "student",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("username", "testuser");
  });

  test("POST /api/v1/login - user not found", async () => {
    mockFindOne.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/login").send({
      email: "missing@example.com",
      password: "whatever",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "User does not exist");
  });

  test("POST /api/v1/login - wrong password", async () => {
    const hashed = await bcrypt.hash("rightpass", 10);
    mockFindOne.mockResolvedValue({
      id: "1",
      email: "a@b.com",
      password: hashed,
      role: "student",
      toObject: () => ({ id: "1", email: "a@b.com", role: "student" }),
    });

    const res = await request(app).post("/api/v1/login").send({
      email: "a@b.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Wrong password, try again");
  });

  test("POST /api/v1/login - success", async () => {
    const hashed = await bcrypt.hash("rightpass", 10);
    mockFindOne.mockResolvedValue({
      id: "1",
      email: "a@b.com",
      password: hashed,
      role: "student",
      toObject: () => ({ id: "1", email: "a@b.com", role: "student" }),
    });

    const res = await request(app).post("/api/v1/login").send({
      email: "a@b.com",
      password: "rightpass",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
  });
});
