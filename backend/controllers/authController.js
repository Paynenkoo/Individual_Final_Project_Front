import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sign = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

const dbg = (...args) => {
  if (process.env.DEBUG_AUTH === "1") console.log("[AUTH]", ...args);
};

export const login = async (req, res) => {
  try {
    const { email: emailOrUsername, password } = req.body || {};
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Email/username і пароль обовʼязкові" });
    }

    const raw = String(emailOrUsername);
    const normalized = raw.toLowerCase().trim();

    
    let user = await User.findOne({
      $or: [
        { $expr: { $eq: [ { $toLower: { $trim: { input: "$email" } } }, normalized ] } },
        { $expr: { $eq: [ { $toLower: { $trim: { input: "$username" } } }, normalized ] } },
      ],
    }).select("+password");

    if (!user) {
      dbg("user not found (normalized):", normalized);
      return res.status(401).json({ message: "Невірні дані" });
    }

    
    let ok = false;
    if (user.password && String(user.password).startsWith("$2")) {
      try { ok = await bcrypt.compare(password, user.password); } catch { ok = false; }
    } else if (password === user.password) {
      dbg("auto-migrate plaintext -> bcrypt for", user.email || user.username);
      user.password = await bcrypt.hash(password, 10);
      await user.save();
      ok = true;
    }

    if (!ok) {
      dbg("password mismatch for", user.email || user.username);
      return res.status(401).json({ message: "Невірні дані" });
    }

    const token = sign(user);
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const me = async (req, res) => {
  
  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
};

export const register = async (req, res) => {
  try {
    let { email, password, username } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email і пароль обовʼязкові" });
    }
    email = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email вже зайнятий" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hash });

    return res.status(201).json({
      token: sign(user),
      user: { id: user._id.toString(), username: user.username, email: user.email },
    });
  } catch (e) {
    console.error("register error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};
