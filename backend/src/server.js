import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5050;

await connectDB();

const app = createApp();

app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
