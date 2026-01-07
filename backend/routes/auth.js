// backend/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const TOKEN_TTL = "7d";

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function toPublicUser(u) {
  if (!u) return null;
  return {
    id: u._id.toString(),
    email: u.email,
    username: u.username,
    bio: u.bio || "",
    avatarUrl: u.avatarUrl || "",
  };
}

/**
 * POST /api/auth/register
 * body: { email, username, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    const mail = String(email || "").trim().toLowerCase();
    const name = String(username || "").trim();
    const pass = String(password || "");

    if (!mail || !name || !pass) {
      return res
        .status(400)
        .json({ message: "Email, нікнейм і пароль обовʼязкові" });
    }

    if (pass.length < 6) {
      return res
        .status(400)
        .json({ message: "Пароль має містити щонайменше 6 символів" });
    }

    const existingEmail = await User.findOne({ email: mail }).lean();
    if (existingEmail) {
      return res.status(409).json({ message: "Email вже зайнятий" });
    }

    const existingName = await User.findOne({ username: name }).lean();
    if (existingName) {
      return res.status(409).json({ message: "Нікнейм вже зайнятий" });
    }

    // ⚠️ ВАЖЛИВО:
    // НЕ хешуємо тут, пароль захешує pre-save хук у моделі User
    const user = await User.create({
      email: mail,
      username: name,
      password: pass,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return res
      .status(500)
      .json({ message: "Помилка сервера при реєстрації" });
  }
});

/**
 * POST /api/auth/login
 * body: { emailOrUsername, email, username, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, email, username, password } = req.body || {};

    const login = String(emailOrUsername || email || username || "").trim();
    const pass = String(password || "");

    if (!login || !pass) {
      return res
        .status(400)
        .json({ message: "Потрібні логін (email або нікнейм) і пароль" });
    }

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    });

    if (!user) {
      return res.status(401).json({ message: "Невірний логін або пароль" });
    }

    const ok = await bcrypt.compare(pass, user.password || "");
    if (!ok) {
      return res.status(401).json({ message: "Невірний логін або пароль" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return res.status(500).json({ message: "Помилка сервера при вході" });
  }
});

/**
 * GET /api/auth/me
 * Поточний юзер з JWT
 */
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Не авторизовано" });
    }

    const token = auth.slice(7);
    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Невалідний токен" });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    return res.json(toPublicUser(user));
  } catch (e) {
    console.error("ME ERROR:", e);
    return res.status(500).json({ message: "Помилка сервера" });
  }
});

export default router;
