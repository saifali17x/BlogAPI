import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import { makeAdminToken, makeToken, authHeader } from "./helpers.js";

beforeEach(() => vi.clearAllMocks());

const mockStats = { totalUsers: 10, totalPosts: 5, publishedPosts: 3, draftPosts: 2, totalComments: 20, totalLikes: 50 };

describe("GET /admin/stats", () => {
  it("returns dashboard stats for ADMIN", async () => {
    prisma.user.count.mockResolvedValue(10);
    prisma.post.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    prisma.comment.count.mockResolvedValue(20);
    prisma.like.count.mockResolvedValue(50);
    prisma.post.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/admin/stats")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(200);
    expect(res.body.stats).toMatchObject({
      totalUsers: 10,
      totalComments: 20,
      totalLikes: 50,
    });
  });

  it("returns 403 for non-admin users", async () => {
    const res = await request(app)
      .get("/admin/stats")
      .set(authHeader(makeToken({ role: "AUTHOR" })));

    expect(res.status).toBe(403);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/admin/stats");
    expect(res.status).toBe(401);
  });
});

describe("GET /admin/users", () => {
  it("returns paginated user list", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 1, name: "Alice", username: "alice", email: "alice@example.com", role: "USER", createdAt: new Date(), _count: { posts: 0, comments: 0 } },
    ]);
    prisma.user.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/admin/users")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("supports role filter", async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.user.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/admin/users?role=AUTHOR")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(200);
  });
});

describe("PUT /admin/users/:id/role", () => {
  it("updates a user's role", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, name: "Bob", role: "USER" });
    prisma.user.update.mockResolvedValue({ id: 2, name: "Bob", username: "bob", email: "bob@test.com", role: "AUTHOR" });

    const res = await request(app)
      .put("/admin/users/2/role")
      .set(authHeader(makeAdminToken()))
      .send({ role: "AUTHOR" });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("AUTHOR");
  });

  it("rejects an invalid role value", async () => {
    const res = await request(app)
      .put("/admin/users/2/role")
      .set(authHeader(makeAdminToken()))
      .send({ role: "SUPERUSER" });

    expect(res.status).toBe(400);
  });

  it("prevents admin from changing their own role", async () => {
    // makeAdminToken uses id: 99
    const res = await request(app)
      .put("/admin/users/99/role")
      .set(authHeader(makeAdminToken()))
      .send({ role: "USER" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/your own role/i);
  });
});

describe("DELETE /admin/users/:id", () => {
  it("deletes a user", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, name: "Bob" });
    prisma.user.delete.mockResolvedValue({});

    const res = await request(app)
      .delete("/admin/users/2")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("prevents admin from deleting themselves", async () => {
    // makeAdminToken uses id: 99
    const res = await request(app)
      .delete("/admin/users/99")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete("/admin/users/999")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(404);
  });
});

describe("GET /admin/posts", () => {
  it("returns all posts including drafts", async () => {
    prisma.post.findMany.mockResolvedValue([
      { id: 1, title: "Draft", published: false, _count: { comments: 0, likes: 0 } },
    ]);
    prisma.post.count.mockResolvedValue(1);

    const res = await request(app)
      .get("/admin/posts")
      .set(authHeader(makeAdminToken()));

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
  });
});
