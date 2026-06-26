import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeToken, authHeader } from "./helpers.js";

const mockPost = { id: 1, title: "Test", slug: "test", published: true };

beforeEach(() => vi.clearAllMocks());

describe("POST /posts/:id/like (toggle like)", () => {
  it("likes a post when not already liked", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.like.findUnique.mockResolvedValue(null);
    prisma.like.create.mockResolvedValue({ id: 1, userId: 1, postId: 1 });
    prisma.like.count.mockResolvedValue(1);

    const res = await request(app)
      .post("/posts/1/like")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(201);
    expect(res.body.liked).toBe(true);
    expect(res.body.likeCount).toBe(1);
  });

  it("unlikes a post when already liked", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.like.findUnique.mockResolvedValue({ id: 1, userId: 1, postId: 1 });
    prisma.like.delete.mockResolvedValue({});
    prisma.like.count.mockResolvedValue(0);

    const res = await request(app)
      .post("/posts/1/like")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
    expect(res.body.likeCount).toBe(0);
  });

  it("returns 404 when post does not exist", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/posts/999/like")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).post("/posts/1/like");
    expect(res.status).toBe(401);
  });
});

describe("GET /posts/:id/likes", () => {
  it("returns like count and liked status", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.like.count.mockResolvedValue(5);
    prisma.like.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/posts/1/likes")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(5);
    expect(res.body.liked).toBe(false);
  });

  it("returns like count without auth (liked=false)", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.like.count.mockResolvedValue(3);

    const res = await request(app).get("/posts/1/likes");
    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(3);
    expect(res.body.liked).toBe(false);
  });
});
