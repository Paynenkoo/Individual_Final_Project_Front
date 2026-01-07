import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import BazilkaPost from "../models/BazilkaPost.js";

const router = Router();

/**
 * GET /api/bazilka
 * Фід постів з пагінацією по курсору ?limit&before
 * Повертає { items, nextCursor }
 */
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const before = req.query.before ? new Date(req.query.before) : null;

    const q = {};
    if (before) q.createdAt = { $lt: before };

    const docs = await BazilkaPost.find(q)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    res.json({
      items: items.map((p) => p.toObject()),
      nextCursor,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/bazilka
 * Створити пост (тільки авторизований)
 * body: { topic, text }
 * Повертає створений пост
 */
router.post("/", protect, async (req, res, next) => {
  try {
    const { topic = "", text = "" } = req.body || {};
    if (!text.trim() && !topic.trim()) {
      return res.status(400).json({ message: "Порожній пост" });
    }
    const post = await BazilkaPost.create({
      authorId: req.user.id,
      authorName: req.user.username || req.user.email || "User",
      topic: topic.trim(),
      text: text.trim(),
      likedBy: [],
      comments: [],
    });
    res.status(201).json(post.toObject());
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/bazilka/:id
 * Видалити власний пост
 * Повертає { ok:true, deletedId }
 */
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await BazilkaPost.findById(id);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });
    if (String(post.authorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Заборонено" });
    }
    await post.deleteOne();
    res.json({ ok: true, deletedId: id });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/bazilka/:id/like
 * Тогл лайку — повертає { liked, likes }
 */
router.post("/:id/like", protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const uid = req.user.id;

    const post = await BazilkaPost.findById(id);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const i = post.likedBy.findIndex((x) => String(x) === String(uid));

    let liked;
    if (i === -1) {
      post.likedBy.push(uid);
      liked = true;
    } else {
      post.likedBy.splice(i, 1);
      liked = false;
    }
    await post.save();

    res.json({ liked, likes: post.likedBy.length });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/bazilka/:id/comments
 * Додати коментар — повертає оновлений пост
 */
router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text = "" } = req.body || {};
    if (!text.trim()) return res.status(400).json({ message: "Порожній коментар" });

    const post = await BazilkaPost.findById(id);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    post.comments = post.comments || [];
    post.comments.push({
      authorId: req.user.id,
      authorName: req.user.username || req.user.email || "User",
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();
    res.json(post.toObject());
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/bazilka/:id/comments/:commentId
 * Редагувати свій коментар — повертає оновлений пост
 */
router.patch("/:id/comments/:commentId", protect, async (req, res, next) => {
  try {
    const { id, commentId } = req.params;
    const { text = "" } = req.body || {};
    if (!text.trim()) return res.status(400).json({ message: "Порожній текст" });

    const post = await BazilkaPost.findById(id);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    const c = (post.comments || []).id?.(commentId);
    if (!c) return res.status(404).json({ message: "Коментар не знайдено" });
    if (String(c.authorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Заборонено" });
    }

    c.text = text.trim();
    await post.save();

    res.json(post.toObject());
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/bazilka/:id/comments/:commentId
 * Видалити свій коментар — повертає оновлений пост
 */
router.delete("/:id/comments/:commentId", protect, async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const post = await BazilkaPost.findById(id);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    const c = (post.comments || []).id?.(commentId);
    if (!c) return res.status(404).json({ message: "Коментар не знайдено" });
    if (String(c.authorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Заборонено" });
    }

    c.deleteOne();
    await post.save();

    res.json(post.toObject());
  } catch (e) {
    next(e);
  }
});

export default router;
