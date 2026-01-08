import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";

const router = Router();

router.get("/:id", async (req, res) => {
  const u = await User.findById(req.params.id).select("-passwordHash");
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json(u);
});

router.post("/:id/follow", requireAuth, async (req, res) => {
  const following = req.params.id;
  const follower = req.user.sub;

  if (following === follower) return res.status(400).json({ message: "Can't follow yourself" });

  await Follow.create({ follower, following });

  await User.findByIdAndUpdate(follower, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(following, { $inc: { followersCount: 1 } });

  res.json({ ok: true });
});

router.post("/:id/unfollow", requireAuth, async (req, res) => {
  const following = req.params.id;
  const follower = req.user.sub;

  const deleted = await Follow.findOneAndDelete({ follower, following });
  if (deleted) {
    await User.findByIdAndUpdate(follower, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(following, { $inc: { followersCount: -1 } });
  }

  res.json({ ok: true });
});

export default router;
