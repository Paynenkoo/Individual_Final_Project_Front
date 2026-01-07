// backend/scripts/seedPosts.js
import "dotenv/config.js";
import mongoose from "mongoose";
import BazilkaPost from "../models/BazilkaPost.js";
import User from "../models/User.js";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("❌ Вкажи userId:   node scripts/seedPosts.js <userId>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Немає MONGO_URI у .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Підключено до MongoDB");

  const me = await User.findById(userId).lean();
  if (!me) {
    console.error("❌ Користувача не знайдено за цим userId");
    process.exit(1);
  }

  const now = new Date();

  const docs = [
    {
      authorId: String(me._id),
      authorName: me.username || me.email || "user",
      topic: "Тренування ТQ",
      text: "Сьогодні відпрацював накладання турнікета за 32 сек. Потрібно вийти на стабільні 25.",
      likedBy: [],
      comments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      authorId: String(me._id),
      authorName: me.username || me.email || "user",
      topic: "NPA вперше",
      text: "Поставив назофарингеальний повітропровід на манекені. Відчуття зрозуміле, далі — відпрацювання алгоритму.",
      likedBy: [],
      comments: [],
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
      updatedAt: now,
    },
  ];

  const res = await BazilkaPost.insertMany(docs);
  console.log(`✅ Додано постів: ${res.length}`);

  await mongoose.disconnect();
  console.log("👋 Готово");
}

main().catch(async (e) => {
  console.error("❌ Помилка сидера:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
