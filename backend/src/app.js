import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import usersRoutes from "./routes/users.routes.js";
import searchRoutes from "./routes/search.routes.js";
import feedRoutes from "./routes/feed.routes.js";

import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5173"],
      credentials: false,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  app.get("/api/ping", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postsRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/search", searchRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
