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
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('Setting up session middleware with production mode:', isProduction);

  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.REPL_ID || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: isProduction,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    proxy: true
  }));

  // Add health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt with data:", req.body);
      const data = insertUserSchema.parse(req.body);

      let user = await storage.getUserByEmail(data.email);
      if (!user) {
        console.log("Creating new user for email:", data.email);
        user = await storage.createUser(data);
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      console.log("Creating magic link with token:", token);
      await storage.createMagicLink({
        token,
        email: data.email,
        expiresAt,
        used: false
      });

      console.log("Sending magic link to email:", data.email);
      await sendMagicLink(data.email, token);

      res.json({ message: "Magic link sent" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid email" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;

      if (typeof token !== "string" || !token) {
        return res.status(400).json({ message: "Invalid token format" });
      }

      const magicLink = await storage.getMagicLinkByToken(token);

      if (!magicLink) {
        return res.status(400).json({ message: "Invalid token" });
      }

      if (magicLink.used) {
        return res.status(400).json({ message: "Token already used" });
      }

      if (magicLink.expiresAt < new Date()) {
        return res.status(400).json({ message: "Token expired" });
      }

      await storage.markMagicLinkAsUsed(token);
      await storage.verifyUser(magicLink.email);

      req.session.email = magicLink.email;

      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      res.json({ message: "Verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    console.log("Session data on /me endpoint:", req.session);
    if (!req.session.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ 
      id: 0,  // Since we're using email-based auth
      email: req.session.email,
      isVerified: true 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}