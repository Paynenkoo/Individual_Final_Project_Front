import mongoose from "mongoose";
const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String }, 
    text: { type: String, required: true, trim: true },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String },
    text: { type: String, required: true, trim: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

export default model("Post", postSchema);
