import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: String,
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const BazilkaPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    authorName: { type: String, default: "" },

    
    topic: { type: String, trim: true, maxlength: 200, default: "" },
    text: { type: String, trim: true, default: "" },

    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

BazilkaPostSchema.index({ createdAt: -1 });

export default mongoose.model("BazilkaPost", BazilkaPostSchema);
