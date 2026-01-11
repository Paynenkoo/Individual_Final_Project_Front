import { Router } from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const router = Router();

// GET /api/feed?q=&limit=10&before=ISO_DATE
router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit || 10) || 10, 50);
    const before = req.query.before ? new Date(String(req.query.before)) : null;

    const filter = {};
    if (before && !Number.isNaN(before.getTime())) {
      filter.createdAt = { $lt: before };
    }
    if (q) {
      filter.text = { $regex: q, $options: "i" };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("author", "username avatarUrl");

    const hasMore = posts.length > limit;
    const slice = hasMore ? posts.slice(0, limit) : posts;

    // comments count for visible posts
    const ids = slice.map((p) => p._id);
    const counts = await Comment.aggregate([
      { $match: { post: { $in: ids } } },
      { $group: { _id: "$post", n: { $sum: 1 } } },
    ]);

    const map = new Map(counts.map((c) => [String(c._id), c.n]));

    const items = slice.map((p) => ({
      _id: p._id,
      authorId: p.author?._id || p.author,
      authorName: p.author?.username || "User",
      avatarUrl: p.author?.avatarUrl || "",
      text: p.text,
      topic: (p.text || "").split("\n")[0].slice(0, 120),
      likesCount: p.likesCount || 0,
      commentsCount: map.get(String(p._id)) || 0,
      createdAt: p.createdAt,
      awardId: p.awardId || null,
    }));

    const nextCursor = hasMore ? slice[slice.length - 1]?.createdAt?.toISOString() : null;

    res.json({ items, nextCursor });
  } catch (e) {
    next(e);
  }
});

export default router;
