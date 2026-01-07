import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  fetchQuizById,
  submitQuiz,
  resetSubmit,
  selectQuizzes,
} from "../../store/slices/quizzesSlice";
import s from "./QuizDetails.module.scss";

export default function QuizDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    current,
    currentStatus,
    currentError,
    submitting,
    submitResult,
    submitError,
  } = useSelector(selectQuizzes);

  const [answers, setAnswers] = useState({}); 
  const topRef = useRef(null);

  useEffect(() => {
    dispatch(fetchQuizById(id));
    return () => dispatch(resetSubmit());
  }, [dispatch, id]);

  const total = current?.questions?.length || 0;
  const canSubmit = useMemo(() => {
    const chosenCount = Object.keys(answers).length;
    return total > 0 && chosenCount === total && !submitting && !submitResult;
  }, [answers, total, submitting, submitResult]);

  const onChoose = (qid, idx) => {
    setAnswers((m) => ({ ...m, [qid]: idx }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.entries(answers).map(([questionId, chosenIndex]) => ({
      questionId,
      chosenIndex,
    }));
    await dispatch(submitQuiz({ id, answers: payload }));
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onRepeat = async () => {
    
    dispatch(resetSubmit());
    setAnswers({});
    await dispatch(fetchQuizById(id));
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={s.wrap} ref={topRef}>
      <div className={s.breadcrumbs}>
        <Link to="/quizzes">← До списку квізів</Link>
      </div>

      {currentStatus === "loading" && <div className={s.notice}>Завантажуємо…</div>}
      {currentError && <div className={s.error}>{String(currentError)}</div>}

      {current && (
        <form onSubmit={onSubmit} className={s.card}>
          <h1 className={s.title}>{current.title}</h1>
          {current.description && <p className={s.desc}>{current.description}</p>}

          {}
          {!submitResult && (
            <>
              <ol className={s.questions}>
                {current.questions.map((q, qi) => (
                  <li key={q._id} className={s.q}>
                    <div className={s.qText}>
                      {qi + 1}. {q.text}
                    </div>
                    <ul className={s.options}>
                      {q.options.map((opt, oi) => {
                        const checked = answers[q._id] === oi;
                        return (
                          <li key={oi}>
                            <label className={`${s.option} ${checked ? s.checked : ""}`}>
                              <input
                                type="radio"
                                name={`q_${q._id}`}
                                checked={checked}
                                onChange={() => onChoose(q._id, oi)}
                              />
                              <span>{opt}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ol>

              <div className={s.actions}>
                <button type="submit" disabled={!canSubmit}>
                  {submitting ? "Відправляємо…" : "Завершити та відправити"}
                </button>
                {}
                <button
                  type="button"
                  className={s.ghost}
                  onClick={() => setAnswers({})}
                  disabled={submitting}
                >
                  Очистити відповіді
                </button>
              </div>
            </>
          )}

          {submitError && <div className={s.error}>{String(submitError)}</div>}

          {}
          {submitResult && (
            <div className={s.result}>
              <h2>Результат</h2>
              <div className={s.score}>
                {submitResult.correctCount} / {submitResult.total} правильних (
                {submitResult.score}%)
              </div>

              <details className={s.details}>
                <summary>Показати деталі</summary>
                <ul>
                  {submitResult.details.map((d, i) => (
                    <li key={i}>
                      Питання {i + 1}: {d.isCorrect ? "✅ правильно" : "❌ неправильно"}{" "}
                      {d.isCorrect ? "" : `(твоя: ${d.chosenIndex + 1}, правильна: ${d.correctIndex + 1})`}
                    </li>
                  ))}
                </ul>
              </details>

              <div className={s.actions}>
                <button type="button" onClick={onRepeat}>
                  Повторити
                </button>
                <Link to="/quizzes" className={s.ghost}>
                  Повернутися до квізів
                </Link>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
