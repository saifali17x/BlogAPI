import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeToken, authHeader } from "./helpers.js";

const authorSelect = { id: 1, name: "Alice", username: "alice", avatar: null };

const mockComment = {
  id: 1,
  content: "Great post!",
  postId: 1,
  authorId: 1,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: authorSelect,
  replies: [],
};

beforeEach(() => vi.clearAllMocks());

describe("GET /comments/post/:postId", () => {
  it("returns top-level comments with replies", async () => {
    prisma.comment.findMany.mockResolvedValue([mockComment]);

    const res = await request(app).get("/comments/post/1");
    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0]).toHaveProperty("replies");
  });
});

describe("POST /comments", () => {
  it("creates a top-level comment", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 1, published: true });
    prisma.comment.create.mockResolvedValue(mockComment);

    const res = await request(app)
      .post("/comments")
      .set(authHeader(makeToken()))
      .send({ content: "Great post!", postId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.comment.content).toBe("Great post!");
  });

  it("creates a nested reply when parentId is provided", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 1 });
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, postId: 1 });
    prisma.comment.create.mockResolvedValue({ ...mockComment, parentId: 1 });

    const res = await request(app)
      .post("/comments")
      .set(authHeader(makeToken()))
      .send({ content: "A reply!", postId: 1, parentId: 1 });

    expect(res.status).toBe(201);
  });

  it("returns 404 when post does not exist", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/comments")
      .set(authHeader(makeToken()))
      .send({ content: "Hello!", postId: 999 });

    expect(res.status).toBe(404);
  });

  it("returns 404 when parentId is for a different post", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 1 });
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, postId: 999 });

    const res = await request(app)
      .post("/comments")
      .set(authHeader(makeToken()))
      .send({ content: "Reply!", postId: 1, parentId: 1 });

    expect(res.status).toBe(404);
  });

  it("rejects empty content", async () => {
    const res = await request(app)
      .post("/comments")
      .set(authHeader(makeToken()))
      .send({ content: "", postId: 1 });

    expect(res.status).toBe(400);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).post("/comments").send({ content: "Hi", postId: 1 });
    expect(res.status).toBe(401);
  });
});

describe("PUT /comments/:id", () => {
  it("allows the comment author to update", async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, authorId: 1 });
    prisma.comment.update.mockResolvedValue({ ...mockComment, content: "Updated!" });

    const res = await request(app)
      .put("/comments/1")
      .set(authHeader(makeToken({ id: 1 })))
      .send({ content: "Updated!" });

    expect(res.status).toBe(200);
    expect(res.body.comment.content).toBe("Updated!");
  });

  it("returns 403 for a different user", async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, authorId: 99 });

    const res = await request(app)
      .put("/comments/1")
      .set(authHeader(makeToken({ id: 1 })))
      .send({ content: "Hack!" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /comments/:id", () => {
  it("allows the comment author to delete", async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, authorId: 1 });
    prisma.comment.delete.mockResolvedValue(mockComment);

    const res = await request(app)
      .delete("/comments/1")
      .set(authHeader(makeToken({ id: 1 })));

    expect(res.status).toBe(200);
  });

  it("allows ADMIN to delete any comment", async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, authorId: 99 });
    prisma.comment.delete.mockResolvedValue(mockComment);

    const res = await request(app)
      .delete("/comments/1")
      .set(authHeader(makeToken({ id: 1, role: "ADMIN" })));

    expect(res.status).toBe(200);
  });

  it("returns 403 when a different non-admin user tries to delete", async () => {
    prisma.comment.findUnique.mockResolvedValue({ ...mockComment, authorId: 99 });

    const res = await request(app)
      .delete("/comments/1")
      .set(authHeader(makeToken({ id: 1, role: "USER" })));

    expect(res.status).toBe(403);
  });
});
