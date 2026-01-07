import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quizzes.js";
import noteRoutes from "./routes/notes.js";
import bazilkaRoutes from "./routes/bazilka.routes.js";
import postsRoutes from "./routes/posts.js";
import usersRoutes from "./routes/users.js";
import awardsRoutes from "./routes/awards.js";
import feedRoutes from "./routes/feed.js";
import searchRoutes from "./routes/search.js";

dotenv.config();

const app = express();

/* =======================
   CORS (DEV)
======================= */
const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, cb) => {
      // Postman/curl без Origin — дозволяємо
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      // не кидаємо Error (бо тоді буде "CORS error" без нормальної відповіді)
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Express 5: НЕ використовуємо app.options("*", ...)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // cors middleware вже вище — заголовки встигнуть проставитись
    return res.sendStatus(204);
  }
  next();
});

/* =======================
   HELMET
======================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json());
app.set("trust proxy", 1);

/* =======================
   DB
======================= */
const { connected, client } = await connectDB();

/* =======================
   SESSION
======================= */
const isProd = process.env.NODE_ENV === "production";

const sessionOptions = {
  name: "sid",
  secret: process.env.SESSION_SECRET || "change_this_in_env",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // prod true (https), dev false
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (connected && client) {
  sessionOptions.store = MongoStore.create({
    client,
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7,
  });
} else {
  console.warn("⚠️ Mongo недоступна → sessions в MemoryStore (dev)");
}

app.use(session(sessionOptions));

/* =======================
   ROUTES
======================= */
app.get("/api/ping", (_req, res) => res.send("pong"));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/bazilka", bazilkaRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/awards", awardsRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/search", searchRoutes);

/* =======================
   ERRORS
======================= */
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5050;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`🚀 Сервер на ${PORT}`));
}

export default app;
