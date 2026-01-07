import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";

const router = Router();

function demoQuizzes() {
  return [
    { title: "Зупинка кровотечі (базовий)", description: "TCCC basics: турнікет, пріоритети, безпека.",
      questions: [
        { text: "Що робимо першим, побачивши сильну кровотечу?", options: ["Викликаємо 103", "Накладаємо турнікет", "Даємо воду"], correctIndex: 1 },
        { text: "Де накладати турнікет?", options: ["Нижче рани", "Вище рани", "На саму рану"], correctIndex: 1 },
      ]},
    { title: "Тактична послідовність MARCH", description: "Massive bleeding, Airway, Respiration, Circulation, Head/Hypothermia.",
      questions: [
        { text: "Що означає літера M у MARCH?", options: ["Medication", "Massive bleeding", "Movement"], correctIndex: 1 },
        { text: "Що робимо на етапі H?", options: ["Контроль температури/гіпотермії", "Накладаємо турнікет", "Оцінка прохідності дихальних шляхів"], correctIndex: 0 },
      ]},
  ];
}

async function ensureSeeded() {
  const count = await Quiz.countDocuments();
  if (count === 0) await Quiz.insertMany(demoQuizzes());
}

router.get("/seed-dev", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") return res.status(403).json({ message: "Forbidden in production" });
    const before = await Quiz.countDocuments();
    if (before === 0) await Quiz.insertMany(demoQuizzes());
    const after = await Quiz.countDocuments();
    res.json({ ok: true, before, after });
  } catch (err) { next(err); }
});

router.get("/results/my", protect, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const rows = await QuizResult.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(limit)
      .populate({ path: "quizId", select: "title" }).lean();

    res.json(rows.map(r => ({
      _id: r._id, quizId: r.quizId?._id || r.quizId, quizTitle: r.quizId?.title || "",
      score: r.score, total: r.total, createdAt: r.createdAt,
    })));
  } catch (err) { next(err); }
});

router.get("/", async (_req, res, next) => {
  try {
    await ensureSeeded();
    const list = await Quiz.find({}, { title: 1, questions: 1 }).lean();
    res.json(list.map(q => ({ _id: q._id, title: q.title, questionsCount: (q.questions || []).length })));
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Некоректний quizId" });
    const quiz = await Quiz.findById(id).lean();
    if (!quiz) return res.status(404).json({ message: "Квіз не знайдено" });
    res.json({
      _id: quiz._id, title: quiz.title, description: quiz.description || "",
      questions: (quiz.questions || []).map(q => ({ _id: q._id, text: q.text, options: (q.options || []).map(o => (typeof o === "string" ? o : String(o))) })),
    });
  } catch (err) { next(err); }
});

router.post("/:id/submit", protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Некоректний quizId" });

    const quiz = await Quiz.findById(id).lean();
    if (!quiz) return res.status(404).json({ message: "Квіз не знайдено" });

    const correctByQid = new Map(
      (quiz.questions || []).map(q => [String(q._id), typeof q.correctIndex === "number" ? q.correctIndex : -1])
    );

    const incoming = Array.isArray(req.body?.answers) ? req.body.answers : [];
    let correctCount = 0;
    const details = incoming.map(a => {
      const qid = String(a.questionId || "");
      const chosen = Number(a.chosenIndex);
      const correct = correctByQid.has(qid) ? Number(correctByQid.get(qid)) : -1;
      const isCorrect = chosen === correct;
      if (isCorrect) correctCount++;
      return { questionId: qid, chosenIndex: isNaN(chosen) ? -1 : chosen, correctIndex: isNaN(correct) ? -1 : correct, isCorrect };
    });

    const total = correctByQid.size;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const result = await QuizResult.create({ userId: req.user.id, quizId: id, score, total, answers: details });
    res.json({ resultId: result._id, score, total, correctCount, details });
  } catch (err) { next(err); }
});

export default router;
