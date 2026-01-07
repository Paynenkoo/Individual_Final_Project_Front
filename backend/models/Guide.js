import mongoose, { Schema } from "mongoose";

const guideSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required : true,
    },
    content:{
        type: String,
        required : true,
    },
    category:{
        type: String,
        required : true,
    },
    images: [
        {
            type: String,
        },
    ],
},
{
    timestamps: true,
  }
)

const Guide = mongoose.model("Guide", guideSchema);

export default Guide;