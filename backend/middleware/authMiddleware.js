import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protect(req, res, next) {
  try {
    let userId = null;

    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) {
      const token = auth.slice(7);
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
        userId = payload?.sub || payload?.id || null;
      } catch {}
    }

    // Фолбек на сесію (якщо токена немає)
    if (!userId) userId = req.session?.userId || req.user?.id || req.user?._id || null;
    if (!userId) return res.status(401).json({ message: "Не авторизовано" });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Сесія недійсна" });

    req.user = { id: user._id.toString(), email: user.email, username: user.username };
    next();
  } catch (e) {
    next(e);
  }
}
