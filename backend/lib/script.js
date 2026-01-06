import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@blog.com" },
    update: {},
    create: {
      email: "admin@blog.com",
      password: hashedPassword,
      name: "Admin User",
      username: "admin",
      role: "ADMIN",
      bio: "Blog administrator",
    },
  });

  const author = await prisma.user.upsert({
    where: { email: "author@blog.com" },
    update: {},
    create: {
      email: "author@blog.com",
      password: hashedPassword,
      name: "John Doe",
      username: "johndoe",
      role: "AUTHOR",
      bio: "Passionate writer and tech enthusiast",
    },
  });

  console.log(`✅ Created users: ${admin.username}, ${author.username}`);

  // Create categories
  const techCategory = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      name: "Technology",
      slug: "technology",
      description: "Posts about technology and programming",
    },
  });

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: "lifestyle" },
    update: {},
    create: {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Posts about lifestyle and personal growth",
    },
  });

  console.log(
    `✅ Created categories: ${techCategory.name}, ${lifestyleCategory.name}`
  );

  // Create tags
  const jsTag = await prisma.tag.upsert({
    where: { slug: "javascript" },
    update: {},
    create: { name: "JavaScript", slug: "javascript" },
  });

  const nodeTag = await prisma.tag.upsert({
    where: { slug: "nodejs" },
    update: {},
    create: { name: "Node.js", slug: "nodejs" },
  });

  const prismaTag = await prisma.tag.upsert({
    where: { slug: "prisma" },
    update: {},
    create: { name: "Prisma", slug: "prisma" },
  });

  console.log(
    `✅ Created tags: ${jsTag.name}, ${nodeTag.name}, ${prismaTag.name}`
  );

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Prisma and Node.js",
      slug: "getting-started-with-prisma-nodejs",
      excerpt:
        "Learn how to set up Prisma ORM with Node.js for your next project",
      content: "Prisma is a modern ORM that makes database access easy...",
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
      categories: {
        connect: [{ id: techCategory.id }],
      },
      tags: {
        connect: [{ id: jsTag.id }, { id: nodeTag.id }, { id: prismaTag.id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Building a REST API with Express",
      slug: "building-rest-api-express",
      excerpt: "A comprehensive guide to building RESTful APIs with Express.js",
      content: "Express.js is the most popular Node.js framework...",
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
      categories: {
        connect: [{ id: techCategory.id }],
      },
      tags: {
        connect: [{ id: jsTag.id }, { id: nodeTag.id }],
      },
    },
  });

  console.log(`✅ Created posts: ${post1.title}, ${post2.title}`);

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "Great tutorial! Very helpful for beginners.",
      authorId: admin.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: "Looking forward to more content like this!",
      authorId: admin.id,
      postId: post2.id,
    },
  });

  console.log(`✅ Created ${2} comments`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
