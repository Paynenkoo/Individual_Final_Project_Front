import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const router = Router();

const createPostSchema = z.object({
  text: z.string().min(1),
  awardId: z.string().optional().nullable(),
});

router.get("/", async (_req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("author", "username avatarUrl");
  res.json(posts);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data" });

  const post = await Post.create({
    author: req.user.sub,
    text: parsed.data.text,
    awardId: parsed.data.awardId || null,
  });

  res.json(post);
});

router.get("/:id/comments", async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate("author", "username avatarUrl");
  res.json(comments);
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ message: "Text required" });

  const c = await Comment.create({
    post: req.params.id,
    author: req.user.sub,
    text,
  });

  res.json(c);
});

export default router;
