import { users, magicLinks, type User, type InsertUser, type MagicLink, type InsertMagicLink } from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createMagicLink(link: InsertMagicLink): Promise<MagicLink>;
  getMagicLinkByToken(token: string): Promise<MagicLink | undefined>;
  markMagicLinkAsUsed(token: string): Promise<void>;
  verifyUser(email: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private magicLinks: Map<number, MagicLink>;
  private currentUserId: number;
  private currentLinkId: number;

  constructor() {
    this.users = new Map();
    this.magicLinks = new Map();
    this.currentUserId = 1;
    this.currentLinkId = 1;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isVerified: false };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createMagicLink(insertLink: InsertMagicLink): Promise<MagicLink> {
    const id = this.currentLinkId++;
    const link: MagicLink = { ...insertLink, id };
    this.magicLinks.set(id, link);
    return link;
  }

  async getMagicLinkByToken(token: string): Promise<MagicLink | undefined> {
    return Array.from(this.magicLinks.values()).find(
      (link) => link.token === token,
    );
  }

  async markMagicLinkAsUsed(token: string): Promise<void> {
    const link = Array.from(this.magicLinks.values()).find(
      (link) => link.token === token,
    );
    if (link) {
      link.used = true;
    }
  }

  async verifyUser(email: string): Promise<void> {
    const user = Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
    if (user) {
      user.isVerified = true;
    }
  }
}

export const storage = new MemStorage();
