import { Router } from "express";
import User from "../models/User.js";
import BazilkaPost from "../models/BazilkaPost.js";

const router = Router();

const esc = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ users: [], posts: [] });

    const re = new RegExp(esc(q), "i");

    const [users, posts] = await Promise.all([
      User.find({ $or: [{ username: re }, { email: re }] })
        .select("_id username avatarUrl")
        .limit(8)
        .lean(),
      BazilkaPost.find({ $or: [{ topic: re }, { text: re }] })
        .select("authorId authorName topic text createdAt likedBy comments")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const mappedPosts = posts.map((p) => ({
      _id: p._id,
      authorId: p.authorId,
      authorName: p.authorName,
      topic: p.topic || "",
      createdAt: p.createdAt,
      likesCount: Array.isArray(p.likedBy) ? p.likedBy.length : 0,
      commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
      snippet: p.text ? String(p.text).slice(0, 140) : "",
    }));

    res.json({ users, posts: mappedPosts });
  } catch (e) {
    next(e);
  }
});

export default router;
