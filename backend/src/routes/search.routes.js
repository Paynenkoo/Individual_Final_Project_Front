import { Router } from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = Router();

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ users: [], posts: [] });

  const users = await User.find({
    username: { $regex: q, $options: "i" },
  }).select("username avatarUrl");

  const posts = await Post.find({
    text: { $regex: q, $options: "i" },
  })
    .limit(30)
    .sort({ createdAt: -1 })
    .populate("author", "username avatarUrl");

  res.json({ users, posts });
});

export default router;
