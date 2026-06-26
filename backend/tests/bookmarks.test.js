import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeToken, authHeader } from "./helpers.js";

const mockPost = { id: 1, title: "Test Post", slug: "test-post", published: true };

beforeEach(() => vi.clearAllMocks());

describe("POST /posts/:id/bookmark (toggle)", () => {
  it("bookmarks a post when not already bookmarked", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.bookmark.findUnique.mockResolvedValue(null);
    prisma.bookmark.create.mockResolvedValue({ id: 1, userId: 1, postId: 1 });

    const res = await request(app)
      .post("/posts/1/bookmark")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(201);
    expect(res.body.bookmarked).toBe(true);
  });

  it("removes a bookmark when already bookmarked", async () => {
    prisma.post.findUnique.mockResolvedValue(mockPost);
    prisma.bookmark.findUnique.mockResolvedValue({ id: 1, userId: 1, postId: 1 });
    prisma.bookmark.delete.mockResolvedValue({});

    const res = await request(app)
      .post("/posts/1/bookmark")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.bookmarked).toBe(false);
  });

  it("returns 404 for a non-existent post", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/posts/999/bookmark")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).post("/posts/1/bookmark");
    expect(res.status).toBe(401);
  });
});

describe("GET /posts/bookmarks", () => {
  it("returns the user's bookmarked posts", async () => {
    prisma.bookmark.findMany.mockResolvedValue([{ post: mockPost }]);
    prisma.bookmark.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/posts/bookmarks")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.bookmarks).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/posts/bookmarks");
    expect(res.status).toBe(401);
  });
});

describe("GET /posts/:id/bookmark", () => {
  it("returns true when bookmarked", async () => {
    prisma.bookmark.findUnique.mockResolvedValue({ id: 1, userId: 1, postId: 1 });

    const res = await request(app)
      .get("/posts/1/bookmark")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.bookmarked).toBe(true);
  });

  it("returns false when not bookmarked", async () => {
    prisma.bookmark.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get("/posts/1/bookmark")
      .set(authHeader(makeToken()));

    expect(res.status).toBe(200);
    expect(res.body.bookmarked).toBe(false);
  });
});
