import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchQuizzes, selectQuizzes, fetchMyQuizResults } from "../../store/slices/quizzesSlice";

export default function Quizzes() {
  const dispatch = useDispatch();
 const { list = [],listStatus = "idle",listError = null,myResults = [],myResultsStatus = "idle" } = useSelector(selectQuizzes) ?? {};

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchMyQuizResults());
  }, [dispatch]);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>
      <h1>Тренування</h1>

      {listStatus === "loading" && <div>Завантажуємо квізи…</div>}
      {listError && <div style={{ color: "crimson" }}>{String(listError)}</div>}

      <ul style={{ display: "grid", gap: 10, margin: "12px 0 24px" }}>
        {list.map((q) => (
          <li key={q._id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{q.title}</div>
            <div style={{ color: "#64748b" }}>{q.questionsCount} питань</div>
            <div style={{ marginTop: 8 }}>
              <Link to={`/quizzes/${q._id}`}>Почати</Link>
            </div>
          </li>
        ))}
      </ul>

      <h2>Мої останні результати</h2>
      {myResultsStatus === "loading" && <div>Завантажуємо історію…</div>}
      <ul style={{ display: "grid", gap: 6 }}>
        {myResults.map((r) => (
          <li key={r._id} style={{ borderBottom: "1px dashed #e5e7eb", paddingBottom: 6 }}>
            <b>{r.quizTitle || r.quizId}</b> — {r.score}% ({r.score}/{r.total} правильних) •{" "}
            {new Date(r.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
