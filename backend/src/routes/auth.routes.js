import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ message: "Invalid data" });
  if (password.length < 6) return res.status(400).json({ message: "Password too short" });

  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email: email.toLowerCase(), passwordHash });

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl },
  });
});

router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) return res.status(400).json({ message: "Invalid data" });

  const user = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
  });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select("_id username email avatarUrl");
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  return res.json({ id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
});

export default router;
