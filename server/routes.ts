import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { randomBytes } from "crypto";
import { sendMagicLink } from "./email";
import session from "express-session";
import MemoryStore from "memorystore";

// Declare session type to include email
declare module "express-session" {
  interface SessionData {
    email?: string;
  }
}

const SessionStore = MemoryStore(session);

export function registerRoutes(app: Express): Server {
  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      let user = await storage.getUserByEmail(data.email);
      if (!user) {
        user = await storage.createUser(data);
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await storage.createMagicLink({
        token,
        email: data.email,
        expiresAt,
        used: false
      });

      await sendMagicLink(data.email, token);

      res.json({ message: "Magic link sent" });
    } catch (error) {
      res.status(400).json({ message: "Invalid email" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    const { token } = req.query;

    if (typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token" });
    }

    const magicLink = await storage.getMagicLinkByToken(token);

    if (!magicLink || magicLink.used || magicLink.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await storage.markMagicLinkAsUsed(token);
    await storage.verifyUser(magicLink.email);

    req.session.email = magicLink.email;

    res.json({ message: "Verified successfully" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ email: req.session.email });
  });

  const httpServer = createServer(app);
  return httpServer;
}