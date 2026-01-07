import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import BazilkaPost from "../models/BazilkaPost.js";
import Award from "../models/Award.js";

const router = Router();
const log = (...a) => console.log("[USERS]", ...a);

/**
 * Overview профілю: базова інформація + лічильники + останні пости та нагороди
 * GET /api/users/:id/overview
 */
router.get("/:id/overview", async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);

    // шукати або по _id, або по username
    const user = await User.findOne(isObjectId ? { _id: id } : { username: id })
      .select("_id username email avatarUrl bio followers following createdAt")
      .lean();

    if (!user) return res.status(404).json({ message: "Користувача не знайдено" });

    const userId = String(user._id);

    const [posts, awards, totalPosts, totalAwards] = await Promise.all([
      BazilkaPost.find({ authorId: userId })
        .select("authorId authorName topic text likedBy comments createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Award.find({ ownerId: userId }) // 👈 змінено на ownerId
        .select("_id title description progress createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      BazilkaPost.countDocuments({ authorId: userId }),
      Award.countDocuments({ ownerId: userId }), // 👈 змінено на ownerId
    ]);

    const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
    const followingCount = Array.isArray(user.following) ? user.following.length : 0;

    const mappedPosts = (posts || []).map((p) => ({
      _id: p._id,
      authorId: p.authorId,
      authorName: p.authorName,
      topic: p.topic,
      text: p.text,
      createdAt: p.createdAt,
      likesCount: Array.isArray(p.likedBy) ? p.likedBy.length : 0,
      commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
    }));

    return res.json({
      user: {
        id: userId,
        username: user.username,
        email: user.email,
        avatar: user.avatarUrl || null,
        bio: user.bio || "",
        createdAt: user.createdAt,
        followersCount,
        followingCount,
        postsCount: totalPosts,
        awardsCount: totalAwards,
      },
      awards: awards || [],
      posts: mappedPosts,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Публічний список підписників
 * GET /api/users/:id/followers
 */
router.get("/:id/followers", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("followers").lean();
    if (!user) return res.status(404).json({ message: "Користувача не знайдено" });

    const ids = (user.followers || []).map(String);
    if (!ids.length) return res.json({ items: [] });

    const docs = await User.find({ _id: { $in: ids } })
      .select("_id username avatarUrl bio")
      .lean();

    res.json({
      items: docs.map((u) => ({
        id: String(u._id),
        username: u.username,
        avatar: u.avatarUrl || null,
        bio: u.bio || "",
      })),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Публічний список на кого підписаний користувач
 * GET /api/users/:id/following
 */
router.get("/:id/following", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("following").lean();
    if (!user) return res.status(404).json({ message: "Користувача не знайдено" });

    const ids = (user.following || []).map(String);
    if (!ids.length) return res.json({ items: [] });

    const docs = await User.find({ _id: { $in: ids } })
      .select("_id username avatarUrl bio")
      .lean();

    res.json({
      items: docs.map((u) => ({
        id: String(u._id),
        username: u.username,
        avatar: u.avatarUrl || null,
        bio: u.bio || "",
      })),
    });
  } catch (e) {
    next(e);
  }
});

// ======== існуючі маршрути ========

router.get("/me", protect, async (req, res, next) => {
  try {
    log("GET /me uid=", req.user?.id);
    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "Користувача не знайдено" });
    res.json(u.toPublic());
  } catch (e) { next(e); }
});

router.put("/me", protect, async (req, res, next) => {
  try {
    const { username, avatarUrl, bio } = req.body || {};
    log("PUT /me uid=", req.user?.id, { username, avatarUrl, bio });
    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "Користувача не знайдено" });

    if (typeof username === "string" && username.trim()) u.username = username.trim();
    if (typeof avatarUrl === "string") u.avatarUrl = avatarUrl.trim();
    if (typeof bio === "string") u.bio = bio.trim();

    await u.save();
    res.json(u.toPublic());
  } catch (e) { next(e); }
});

router.get("/me/following", protect, async (req, res, next) => {
  try {
    log("GET /me/following uid=", req.user?.id);
    const u = await User.findById(req.user.id).select("following");
    res.json({ following: (u?.following || []).map(String) });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    log("GET /:id profile", req.params.id);
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "Користувача не знайдено" });
    res.json(u.toPublic());
  } catch (e) { next(e); }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const before = req.query.before ? new Date(req.query.before) : null;
    const q = { authorId: req.params.id };
    if (before) q.createdAt = { $lt: before };
    log("GET /:id/posts", req.params.id, { limit, before: before?.toISOString() });

    const docs = await BazilkaPost.find(q)
      .select("authorId authorName topic text likedBy comments createdAt")
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    const mapped = items.map(p => ({
      ...p,
      likesCount: Array.isArray(p.likedBy) ? p.likedBy.length : 0,
      commentsCount: Array.isArray(p.comments) ? p.comments.length : 0,
    }));

    res.json({ items: mapped, nextCursor });
  } catch (e) { next(e); }
});

router.post("/:id/follow", protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;
    if (String(targetId) === String(meId)) {
      return res.status(400).json({ message: "Не можна підписатися на себе" });
    }
    log("POST /:id/follow", { meId, targetId });

    const me = await User.findById(meId).select("following");
    const target = await User.findById(targetId).select("followers");
    if (!target) return res.status(404).json({ message: "Користувача не знайдено" });

    if (!me.following.some(id => String(id) === String(targetId))) {
      me.following.push(targetId);
      await me.save();
    }
    if (!target.followers.some(id => String(id) === String(meId))) {
      target.followers.push(meId);
      await target.save();
    }

    res.json({ ok: true, targetId });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/unfollow", protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const meId = req.user.id;
    log("POST /:id/unfollow", { meId, targetId });

    const me = await User.findById(meId).select("following");
    const target = await User.findById(targetId).select("followers");
    if (!target) return res.status(404).json({ message: "Користувача не знайдено" });

    me.following = me.following.filter(id => String(id) !== String(targetId));
    target.followers = target.followers.filter(id => String(id) !== String(meId));
    await me.save();
    await target.save();

    res.json({ ok: true, targetId });
  } catch (e) {
    next(e);
  }
});

export default router;
