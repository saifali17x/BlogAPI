import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeAuthorToken, makeAdminToken, makeToken, authHeader } from "./helpers.js";

const mockPost = {
  id: 1,
  title: "Hello World",
  slug: "hello-world",
  excerpt: "A short excerpt",
  content: "This is the full content of the post",
  coverImage: null,
  published: true,
  viewCount: 10,
  readingTime: 1,
  authorId: 1,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 1, name: "Alice", username: "alice", avatar: null },
  categories: [],
  tags: [],
  _count: { comments: 3, likes: 7 },
};

beforeEach(() => vi.clearAllMocks());

describe("GET /posts", () => {
  it("returns paginated published posts", async () => {
    prisma.post.findMany.mockResolvedValue([mockPost]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("supports search query", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    prisma.post.count.mockResolvedValue(0);

    const res = await request(app).get("/posts?search=typescript");
    expect(res.status).toBe(200);
  });
});

describe("GET /posts/:slug", () => {
  it("returns a single post by slug", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, comments: [] });
    prisma.post.update.mockResolvedValue(mockPost);

    const res = await request(app).get("/posts/hello-world");

    expect(res.status).toBe(200);
    expect(res.body.post.slug).toBe("hello-world");
  });

  it("returns 404 for unknown slug", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/posts/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("GET /posts/:slug/related", () => {
  it("returns related posts", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, tags: [{ id: 1 }], categories: [{ id: 1 }] });
    prisma.post.findMany.mockResolvedValue([]);

    const res = await request(app).get("/posts/hello-world/related");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("posts");
  });
});

describe("POST /posts", () => {
  it("creates a post for an AUTHOR", async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    prisma.post.create.mockResolvedValue(mockPost);

    const res = await request(app)
      .post("/posts")
      .set(authHeader(makeAuthorToken()))
      .send({ title: "Hello World", content: "This is content" });

    expect(res.status).toBe(201);
    expect(res.body.post.title).toBe("Hello World");
  });

  it("allows USER role to create posts", async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    prisma.post.create.mockResolvedValue(mockPost);

    const res = await request(app)
      .post("/posts")
      .set(authHeader(makeToken({ role: "USER" })))
      .send({ title: "Hello World", content: "Content here" });

    expect(res.status).toBe(201);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).post("/posts").send({ title: "Hello" });
    expect(res.status).toBe(401);
  });

  it("validates title length", async () => {
    const res = await request(app)
      .post("/posts")
      .set(authHeader(makeAuthorToken()))
      .send({ title: "Hi" });

    expect(res.status).toBe(400);
  });
});

describe("PUT /posts/:id", () => {
  it("updates post as the author", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 1 });
    prisma.post.findUnique.mockResolvedValueOnce({ ...mockPost, authorId: 1 });
    prisma.post.update.mockResolvedValue({ ...mockPost, title: "Updated Title" });

    const res = await request(app)
      .put("/posts/1")
      .set(authHeader(makeAuthorToken()))
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
  });

  it("returns 403 when a different user tries to edit", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 999 });

    const res = await request(app)
      .put("/posts/1")
      .set(authHeader(makeAuthorToken()))
      .send({ title: "Hacked" });

    expect(res.status).toBe(403);
  });
});

describe("PATCH /posts/:id/publish", () => {
  it("publishes a post", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 1, published: false });
    prisma.post.update.mockResolvedValue({ ...mockPost, published: true });

    const res = await request(app)
      .patch("/posts/1/publish")
      .set(authHeader(makeAuthorToken()));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/published/i);
  });
});

describe("DELETE /posts/:id", () => {
  it("allows AUTHOR to delete their own post", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 1 });
    prisma.post.delete.mockResolvedValue(mockPost);

    const res = await request(app)
      .delete("/posts/1")
      .set(authHeader(makeAuthorToken()));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("returns 403 for a post owned by someone else", async () => {
    prisma.post.findUnique.mockResolvedValue({ ...mockPost, authorId: 999 });

    const res = await request(app)
      .delete("/posts/1")
      .set(authHeader(makeAuthorToken()));

    expect(res.status).toBe(403);
  });
});
