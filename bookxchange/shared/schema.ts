import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  location: true,
});

// Book Listing Schema
export const bookListings = pgTable("book_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  listingType: text("listing_type").notNull(), // "sell" or "buy"
  location: text("location").notNull(),
  status: text("status").notNull().default("active"), // active, sold, deleted
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookListingSchema = createInsertSchema(bookListings).omit({
  id: true,
  createdAt: true,
});

// Messages Schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  listingId: integer("listing_id").references(() => bookListings.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Conversations Schema (to group messages between two users)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  listingId: integer("listing_id").references(() => bookListings.id),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BookListing = typeof bookListings.$inferSelect;
export type InsertBookListing = z.infer<typeof insertBookListingSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Book Categories
export const BOOK_CATEGORIES = [
  'Textbooks', 
  'Science', 
  'Literature', 
  'Business', 
  'Computer Science', 
  'Engineering', 
  'Mathematics', 
  'History',
  'Art & Design', 
  'Medicine', 
  'Law', 
  'Philosophy', 
  'Other'
];

// Book Conditions
export const BOOK_CONDITIONS = [
  'Like New', 
  'Very Good', 
  'Good', 
  'Fair', 
  'Poor'
];

// Listing Types
export const LISTING_TYPES = [
  'sell',
  'buy'
];
