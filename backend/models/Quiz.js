import mongoose from "mongoose";
const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    options: { type: [String], required: true, validate: v => Array.isArray(v) && v.length >= 2 },
    correctIndex: { type: Number, required: true },
  },
  { _id: true }
);

const QuizSchema = new Schema(
  { title: { type: String, required: true, trim: true }, description: { type: String, default: "" }, questions: { type: [QuestionSchema], default: [] } },
  { timestamps: true }
);

QuizSchema.virtual("questionsCount").get(function () {
  return Array.isArray(this.questions) ? this.questions.length : 0;
});

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
