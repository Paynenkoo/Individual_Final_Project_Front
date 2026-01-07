import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });

/**
 * POST /api/auth/register
 * body: { username, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const usernameNorm = String(username).trim();

    const exists = await User.findOne({
      $or: [{ email: emailNorm }, { username: usernameNorm }],
    });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: usernameNorm,
      email: emailNorm,
      password: hash,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("REGISTER error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * body: { emailOrUsername, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body || {};

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "emailOrUsername and password required" });
    }

    const value = String(emailOrUsername).toLowerCase().trim();

    const user = await User.findOne({
      $or: [
        { email: value },
        { username: value },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "User has no password hash" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("LOGIN error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    return res.json(user);
  } catch (e) {
    console.error("ME error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
