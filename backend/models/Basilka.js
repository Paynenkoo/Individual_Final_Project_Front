 
const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const Comment = require("../models/Comment");

router.post("/posts", async (req, res) => {
  try {
    const { author, text } = req.body;
    const newPost = new Post({ author, text });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: "Помилка при створенні поста" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("comments");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Помилка при отриманні постів" });
  }
});

router.post("/comments", async (req, res) => {
  try {
    const { postId, author, text } = req.body;

    const comment = new Comment({ postId, author, text });
    const savedComment = await comment.save();

    
    await Post.findByIdAndUpdate(postId, { $push: { comments: savedComment._id } });

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ error: "Помилка при додаванні коментаря" });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Помилка при отриманні коментарів" });
  }
});

module.exports = router;
