// backend/controllers/users.overview.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Award from "../models/Award.js";
// import Follow from "../models/Follow.js"; // розкоментуй якщо є окрема модель Follow

/**
 * GET /api/users/:id/overview
 * Повертає: user basic info + followers/following counts + awards[] + posts[]
 */
export async function getUserOverview(req, res, next) {
  try {
    const { id } = req.params;

    // Дозволимо шукати і по ObjectId, і по username
    const isObjectId = mongoose.isValidObjectId(id);
    const user = await User.findOne(isObjectId ? { _id: id } : { username: id })
      .select("_id username email avatar bio followers following createdAt")
      .lean();

    if (!user) return res.status(404).json({ message: "Користувача не знайдено" });

    // Followers / following — два підходи: вбудовані масиви у User або окрема колекція Follow
    let followersCount = Array.isArray(user.followers) ? user.followers.length : undefined;
    let followingCount = Array.isArray(user.following) ? user.following.length : undefined;

    // Якщо у тебе є окрема модель Follow, розкоментуй нижче та закоментуй обчислення по масивах
    // const [followersCount, followingCount] = await Promise.all([
    //   Follow.countDocuments({ followee: user._id }),
    //   Follow.countDocuments({ follower: user._id }),
    // ]);

    const [posts, awards, totalPosts, totalAwards] = await Promise.all([
      Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id content createdAt author")
        .lean(),
      Award.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("_id title description progress createdAt")
        .lean(),
      Post.countDocuments({ author: user._id }),
      Award.countDocuments({ user: user._id }),
    ]);

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        bio: user.bio || "",
        createdAt: user.createdAt,
        followersCount: typeof followersCount === "number" ? followersCount : 0,
        followingCount: typeof followingCount === "number" ? followingCount : 0,
        postsCount: totalPosts,
        awardsCount: totalAwards,
      },
      awards,
      posts,
    });
  } catch (e) {
    next(e);
  }
}
