import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeToken, authHeader } from "./helpers.js";
import bcrypt from "bcryptjs";

const mockUser = {
  id: 1,
  email: "alice@example.com",
  name: "Alice",
  username: "alice",
  role: "USER",
  password: bcrypt.hashSync("password123", 10),
  refreshToken: null,
  createdAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

describe("POST /auth/register", () => {
  it("registers a new user successfully", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ ...mockUser });
    prisma.user.update.mockResolvedValue(mockUser);

    const res = await request(app).post("/auth/register").send({
      email: "alice@example.com",
      password: "password123",
      username: "alice",
      name: "Alice",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.email).toBe("alice@example.com");
  });

  it("rejects duplicate email", async () => {
    prisma.user.findFirst.mockResolvedValue(mockUser);

    const res = await request(app).post("/auth/register").send({
      email: "alice@example.com",
      password: "password123",
      username: "alice2",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it("rejects invalid email format", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "not-an-email",
      password: "password123",
      username: "alice",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("rejects password shorter than 6 characters", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "alice@example.com",
      password: "123",
      username: "alice",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("logs in with valid credentials", async () => {
    prisma.user.findFirst.mockResolvedValue(mockUser);
    prisma.user.update.mockResolvedValue(mockUser);

    const res = await request(app).post("/auth/login").send({
      username: "alice",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.user.username).toBe("alice");
  });

  it("rejects wrong password", async () => {
    prisma.user.findFirst.mockResolvedValue(mockUser);

    const res = await request(app).post("/auth/login").send({
      username: "alice",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("rejects non-existent user", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(app).post("/auth/login").send({
      username: "ghost",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});

describe("POST /auth/refresh-token", () => {
  it("issues new tokens with a valid refresh token", async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    prisma.user.findUnique.mockResolvedValue({ ...mockUser, refreshToken: token });
    prisma.user.update.mockResolvedValue(mockUser);

    const res = await request(app).post("/auth/refresh-token").send({ refreshToken: token });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("rejects missing refresh token", async () => {
    const res = await request(app).post("/auth/refresh-token").send({});
    expect(res.status).toBe(401);
  });

  it("rejects an invalid refresh token", async () => {
    const res = await request(app).post("/auth/refresh-token").send({ refreshToken: "bad.token" });
    expect(res.status).toBe(403);
  });
});

describe("GET /auth/profile", () => {
  it("returns profile for authenticated user", async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      bio: null,
      avatar: null,
      _count: { posts: 2, comments: 5 },
    });

    const res = await request(app)
      .get("/auth/profile")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.user._count.posts).toBe(2);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/auth/profile");
    expect(res.status).toBe(401);
  });

  it("returns 403 with a malformed token", async () => {
    const res = await request(app).get("/auth/profile").set({ Authorization: "Bearer garbage" });
    expect(res.status).toBe(403);
  });
});

describe("GET /auth/users/:username", () => {
  it("returns a public user profile", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: "Alice",
      username: "alice",
      bio: "Hello world",
      avatar: null,
      createdAt: new Date(),
      posts: [],
      _count: { posts: 0 },
    });

    const res = await request(app).get("/auth/users/alice");
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("alice");
    expect(res.body.user).not.toHaveProperty("email");
  });

  it("returns 404 for unknown username", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/auth/users/nobody");
    expect(res.status).toBe(404);
  });
});
