import Post from "../models/Post.js";

export const listPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    const post = await Post.create({
      author: req.user.id,
      authorName: req.user.username || req.user.email,
      text: text.trim(),
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user.id,
      authorName: req.user.username || req.user.email,
      text: text.trim(),
    });
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const uid = String(req.user.id);
    const i = post.likedBy.findIndex((x) => String(x) === uid);

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
    res.status(500).json({ message: "Failed to toggle like" });
  }
};
