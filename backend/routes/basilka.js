import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.post("/", protect, async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: "text обовʼязковий" });

  const post = await Post.create({
    authorId: req.user._id,
    author: req.user.username,
    text,
    comments: []
  });

  res.status(201).json(post);
});

router.post("/", protect, async (req, res) => {
  const { text, awardId = null } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "text обовʼязковий" });

  const post = await Post.create({
    authorId: req.user._id,
    author: req.user.username,
    text: text.trim(),
    awardId: awardId && mongoose.isValidObjectId(awardId) ? awardId : null,
    comments: [],
  });

  res.status(201).json(post);
});

export default router;
