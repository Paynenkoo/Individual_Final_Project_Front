import mongoose from "mongoose";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);

   const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("✅ MongoDB connected");
}
