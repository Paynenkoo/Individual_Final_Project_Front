import { Router } from "express";
import BazilkaPost from "../models/BazilkaPost.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const q = (req.query.q || "").trim();

    const query = {};
    if (before) query.createdAt = { $lt: before };
    if (q) {
      query.$or = [
        { topic: { $regex: q, $options: "i" } },
        { text:  { $regex: q, $options: "i" } },
      ];
    }

    const docs = await BazilkaPost.find(query)
      .select("authorId authorName topic text likedBy comments createdAt")
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    
    const normalized = items.map(p => ({
      ...p,
      likesCount: Array.isArray(p.likedBy) ? p.likedBy.length : 0,
      commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
    }));

    res.json({ items: normalized, nextCursor });
  } catch (e) {
    next(e);
  }
});

export default router;
