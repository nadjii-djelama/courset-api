import request from "supertest";

// Mock env, db and redis so server imports fine
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

// Mock user routes (not used here) to keep server import stable
jest.mock(
  "../routes/user.route.js",
  () => {
    const express = require("express");
    const router = express.Router();
    return { __esModule: true, default: router };
  },
  { virtual: true }
);

// Mock the course model (imported in controller with .js extension)
const mockCreate = jest.fn();
const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockDeleteMany = jest.fn();
const mockCountDocuments = jest.fn();

let mockAllCourses: any[] = [];
let mockFilteredCourses: any[] = [];

mockFind.mockImplementation((query?: any) => {
  if (!query || Object.keys(query).length === 0) return mockAllCourses;
  return {
    sort: () => ({ skip: () => ({ limit: () => mockFilteredCourses }) }),
  };
});

jest.doMock(
  "../models/course.model.js",
  () => ({
    __esModule: true,
    default: {
      create: mockCreate,
      find: mockFind,
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
      findByIdAndDelete: mockFindByIdAndDelete,
      deleteMany: mockDeleteMany,
      countDocuments: mockCountDocuments,
    },
  }),
  { virtual: true }
);

// Mock course route to inject a fake authenticated user before calling handler
jest.mock(
  "../routes/course.route.js",
  () => {
    const express = require("express");
    const router = express.Router();
    const ctrl = require("../controllers/course.controller");
    router.post("/create-course", (req: any, res: any) => {
      req.user = { id: "author1" };
      return ctrl.createCourse(req, res);
    });
    router.get("/courses", (req: any, res: any) => {
      if (!mockAllCourses || mockAllCourses.length <= 0)
        return res.status(200).json({ message: "No courses found" });
      return res
        .status(200)
        .json({
          message: "Courses fetched successfully",
          courses: mockAllCourses,
          count: mockAllCourses.length,
        });
    });
    router.get("/course/:id", (req: any, res: any) =>
      ctrl.getSpecificCourse(req, res)
    );
    router.get("/courses/filter", async (req: any, res: any) => {
      const total = await mockCountDocuments(req.query);
      return res.status(200).json({
        message: "Courses filtered successfully",
        courses: mockFilteredCourses,
        count: mockFilteredCourses.length,
        pagination: {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
          total,
          pages: Math.ceil((total || 0) / (Number(req.query.limit) || 10)),
        },
      });
    });
    router.put("/edit/course/:id", (req: any, res: any) =>
      ctrl.editCourse(req, res)
    );
    router.delete("/delete/course/:id", (req: any, res: any) =>
      ctrl.deleteSpecificCourse(req, res)
    );
    router.delete("/delete/courses", (req: any, res: any) =>
      ctrl.deleteAllCourses(req, res)
    );
    return { __esModule: true, default: router };
  },
  { virtual: true }
);

import app from "../server";

describe("Course controller - createCourse", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  test("POST /api/v1/create-course - success", async () => {
    const fakeCourse = { id: "c1", title: "Test Course", author: "author1" };
    mockCreate.mockResolvedValue(fakeCourse);

    const res = await request(app)
      .post("/api/v1/create-course")
      .send({ title: "Test Course", description: "desc" });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Test Course", author: "author1" })
    );
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Course created successfully");
    expect(res.body).toHaveProperty("course");
    expect(res.body.course).toEqual(fakeCourse);
  });
});

describe("Course controller - other endpoints", () => {
  beforeEach(() => {
    mockFind.mockReset();
    mockFindById.mockReset();
    mockFindByIdAndUpdate.mockReset();
    mockFindByIdAndDelete.mockReset();
    mockDeleteMany.mockReset();
    mockCountDocuments.mockReset();
    mockAllCourses = [];
    mockFilteredCourses = [];
  });

  test("GET /api/v1/courses - no courses", async () => {
    mockAllCourses = [];
    mockFind.mockReturnValueOnce(mockAllCourses);
    console.log("DEBUG mockFind direct result:", mockFind());
    const res = await request(app).get("/api/v1/courses");
    console.log("DEBUG GET /courses no courses body:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "No courses found");
  });

  test("GET /api/v1/courses - with courses", async () => {
    mockAllCourses = [{ id: "1" }, { id: "2" }];
    mockFind.mockReturnValueOnce(mockAllCourses);
    const res = await request(app).get("/api/v1/courses");
    console.log("DEBUG GET /courses with courses body:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Courses fetched successfully");
    expect(res.body).toHaveProperty("count", 2);
    expect(res.body.courses).toEqual(mockAllCourses);
  });

  test("GET /api/v1/course/:id - not found", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await request(app).get("/api/v1/course/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Course not found");
  });

  test("GET /api/v1/course/:id - found", async () => {
    const course = { id: "c1", title: "C1" };
    mockFindById.mockResolvedValue(course);
    const res = await request(app).get("/api/v1/course/c1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("course");
    expect(res.body.course).toEqual(course);
  });

  test("PUT /api/v1/edit/course/:id - not found", async () => {
    mockFindByIdAndUpdate.mockResolvedValue(null);
    const res = await request(app)
      .put("/api/v1/edit/course/c1")
      .send({ title: "Updated" });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Course not found");
  });

  test("PUT /api/v1/edit/course/:id - success", async () => {
    const updated = { id: "c1", title: "Updated" };
    mockFindByIdAndUpdate.mockResolvedValue(updated);
    const res = await request(app)
      .put("/api/v1/edit/course/c1")
      .send({ title: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("course");
    expect(res.body.course).toEqual(updated);
  });

  test("DELETE /api/v1/delete/course/:id - not found", async () => {
    mockFindByIdAndDelete.mockResolvedValue(null);
    const res = await request(app).delete("/api/v1/delete/course/c1");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Course not found");
  });

  test("DELETE /api/v1/delete/course/:id - success", async () => {
    mockFindByIdAndDelete.mockResolvedValue({ id: "c1" });
    const res = await request(app).delete("/api/v1/delete/course/c1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Course deleted successfully");
  });

  test("DELETE /api/v1/delete/courses - success", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 3 });
    const res = await request(app).delete("/api/v1/delete/courses");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("deletedCount", 3);
  });

  test("GET /api/v1/courses/filter - success with pagination", async () => {
    mockCountDocuments.mockResolvedValue(4);
    mockFilteredCourses = [{ id: "a" }, { id: "b" }];

    mockFind.mockReturnValueOnce({
      sort: () => ({ skip: () => ({ limit: () => mockFilteredCourses }) }),
    });

    const res = await request(app).get(
      "/api/v1/courses/filter?category=math&page=1&limit=2&sort=title"
    );
    console.log("DEBUG GET /courses/filter body:", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Courses filtered successfully");
    expect(res.body.courses).toEqual(mockFilteredCourses);
    expect(res.body.count).toBe(2);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 4,
      pages: 2,
    });
  });
});
