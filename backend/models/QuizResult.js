import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const AnswerSchema = new Schema(
  {
    questionId: { type: Types.ObjectId, required: true },
    chosenIndex: { type: Number, required: true },
    correctIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizResultSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: Types.ObjectId, ref: "Quiz", required: true, index: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: { type: [AnswerSchema], default: [] },
  },
  { timestamps: true }
);

QuizResultSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

export default model("QuizResult", QuizResultSchema);
