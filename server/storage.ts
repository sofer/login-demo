import { users, magicLinks, type User, type InsertUser, type MagicLink, type InsertMagicLink } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createMagicLink(link: InsertMagicLink): Promise<MagicLink>;
  getMagicLinkByToken(token: string): Promise<MagicLink | undefined>;
  markMagicLinkAsUsed(token: string): Promise<void>;
  verifyUser(email: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Creating user:", insertUser);
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log("Getting user by email:", email);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createMagicLink(insertLink: InsertMagicLink): Promise<MagicLink> {
    console.log("Creating magic link, first cleaning up old links for email:", insertLink.email);

    // Delete any existing magic links for this email
    await db
      .delete(magicLinks)
      .where(eq(magicLinks.email, insertLink.email));

    console.log("Creating new magic link");
    const [link] = await db
      .insert(magicLinks)
      .values(insertLink)
      .returning();
    return link;
  }

  async getMagicLinkByToken(token: string): Promise<MagicLink | undefined> {
    console.log("Getting magic link by token:", token);
    const [link] = await db
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.token, token));
    console.log("Found magic link:", link);
    return link;
  }

  async markMagicLinkAsUsed(token: string): Promise<void> {
    console.log("Marking magic link as used:", token);
    await db
      .update(magicLinks)
      .set({ used: true })
      .where(eq(magicLinks.token, token));
  }

  async verifyUser(email: string): Promise<void> {
    console.log("Verifying user:", email);
    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.email, email));
  }
}

export const storage = new DatabaseStorage();