import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").default("admin"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  type: text("type").notNull(), // 'image', 'video', 'graphic'
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: text("published_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
  isPublished: integer("is_published").default(1),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

export const consentLogs = sqliteTable("consent_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ipHash: text("ip_hash"),
  consentGiven: integer("consent_given").default(0),
  timestamp: text("timestamp").default(new Date().toISOString()),
  userAgent: text("user_agent"),
});
