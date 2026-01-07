import mongoose from "mongoose";
const { Schema } = mongoose;

const progressSchema = new Schema(
  {
    value: { type: Number, required: true }, 
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const awardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    unit: { type: String, default: "" },     
    target: { type: Number, default: 0 },    
    progress: [progressSchema],              
  },
  { timestamps: true }
);

export default mongoose.model("Award", awardSchema);
