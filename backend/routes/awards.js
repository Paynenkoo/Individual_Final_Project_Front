import { Router } from "express";
import mongoose from "mongoose";
import Award from "../models/Award.js";
import Post from "../models/Post.js";
import protect from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  const items = await Award.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

router.post("/", protect, async (req, res) => {
  const { title, description = "", unit = "", target = 0 } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "title обовʼязковий" });
  const award = await Award.create({
    userId: req.user._id,
    title: title.trim(),
    description,
    unit,
    target: Number(target) || 0,
    progress: [],
  });
  res.status(201).json(award);
});

router.get("/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Невірний id" });

  const award = await Award.findOne({ _id: id, userId: req.user._id });
  if (!award) return res.status(404).json({ error: "Не знайдено" });

  const posts = await Post.find({ awardId: id, authorId: req.user._id }).sort({ createdAt: -1 });
  res.json({ award, posts });
});

router.patch("/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Невірний id" });

  const allow = new Set(["title", "description", "unit", "target"]);
  const patch = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (!allow.has(k)) continue;
    patch[k] = k === "target" ? Number(v) || 0 : v;
  }

  const updated = await Award.findOneAndUpdate({ _id: id, userId: req.user._id }, { $set: patch }, { new: true });
  if (!updated) return res.status(404).json({ error: "Не знайдено" });
  res.json(updated);
});

router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Невірний id" });

  const del = await Award.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!del) return res.status(404).json({ error: "Не знайдено" });
  res.json({ ok: true });
});

router.post("/:id/progress", protect, async (req, res) => {
  const { id } = req.params;
  const { value, note = "" } = req.body || {};
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Невірний id" });

  const inc = Number(value);
  if (!Number.isFinite(inc)) return res.status(400).json({ error: "value має бути числом" });

  const updated = await Award.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $push: { progress: { value: inc, note } } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Не знайдено" });
  res.status(201).json(updated);
});

router.delete("/:id/progress/:pid", protect, async (req, res) => {
  const { id, pid } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(pid)) {
    return res.status(400).json({ error: "Невірний id" });
  }
  const updated = await Award.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $pull: { progress: { _id: pid } } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Не знайдено" });
  res.json(updated);
});

export default router;
