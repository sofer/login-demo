import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug logging middleware for environment variables
app.use((req, _res, next) => {
  if (req.path === '/api/auth/login') {
    log('Environment Variables:');
    log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
    log(`REPL_ID: ${process.env.REPL_ID}`);
    log(`NODE_ENV: ${process.env.NODE_ENV}`);
  }
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Handle static files and client routing
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Serve static files first
    serveStatic(app);

    // Then handle all routes, including API and client-side routing
    app.get("*", (req, res, next) => {
      // API routes should be handled by their respective handlers
      if (req.path.startsWith("/api")) {
        return next();
      }

      // All other routes should serve the React app
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
    log(`Environment: ${app.get("env")}`);
    log(`REPL_SLUG: ${process.env.REPL_SLUG || 'Not in Replit'}`);
    log(`REPL_ID: ${process.env.REPL_ID || 'Not in Replit'}`);
    log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
})();