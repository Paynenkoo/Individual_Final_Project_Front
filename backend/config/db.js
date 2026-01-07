// backend/config/db.js
import mongoose from "mongoose";

const safeUri = (uri = "") =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, "//<user>:<pass>@");

export default async function connectDB() {
  const raw = process.env.MONGO_URI || process.env.MONGODB_URI || "";
  const required =
    (process.env.MONGO_REQUIRED || "false").toLowerCase() === "true";

  if (!raw) {
    console.warn(
      "⚠️ MONGO_URI не заданий у .env — пропускаємо підключення до MongoDB (dev fallback)."
    );
    if (required) throw new Error("MONGO_URI is required but missing");
    return { connected: false, connection: null, client: null };
  }

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(raw, {
      serverSelectionTimeoutMS: 10000,
    });

    const conn = mongoose.connection;

    console.log(`✅ MongoDB підключено → ${conn.host}/${conn.name}`);
    console.log(`ℹ️ URI: ${safeUri(raw)}`);

    // Невелика діагностика тільки НЕ в production
    if (process.env.NODE_ENV !== "production") {
      try {
        const cols = await conn.db.listCollections().toArray();
        const list = cols.map((c) => c.name).join(", ") || "немає колекцій";
        console.log(`📦 Колекції: ${list}`);

        const usersCount = await conn.db
          .collection("users")
          .countDocuments()
          .catch(() => null);
        if (usersCount !== null) console.log(`👥 users.count: ${usersCount}`);
      } catch {
        // ignore diagnostics errors
      }
    }

    return { connected: true, connection: conn, client: conn.getClient() };
  } catch (err) {
    console.error(
      "❌ Помилка підключення до MongoDB:",
      err?.message || err
    );
    console.warn(
      "⚠️ Продовжуємо без MongoDB (dev fallback). Перевір MONGO_URI у .env або non-SRV рядок у Atlas."
    );

    if (required) throw err;
    return { connected: false, connection: null, client: null, error: err };
  }
}
