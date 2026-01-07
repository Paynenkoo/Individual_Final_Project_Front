 
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    password: { type: String, required: true },

    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },

    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    avatarUrl: this.avatarUrl || "",
    bio: this.bio || "",
    createdAt: this.createdAt,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
  };
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
