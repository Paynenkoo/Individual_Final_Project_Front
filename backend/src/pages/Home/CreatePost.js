import React, { useMemo, useState } from "react";
import api from "../../api/axios";
import s from "./CreatePost.module.scss";

export default function CreatePost({ onCreated }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading
  const [error, setError] = useState(null);

  const trimmed = text.trim();
  const max = 500;

  const left = useMemo(() => max - text.length, [text.length]);
  const tooLong = left < 0;

  const canSubmit = trimmed.length > 0 && !tooLong && status !== "loading";

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError(null);

    try {
      await api.post("/posts", { text: trimmed });
      setText("");
      onCreated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Не вдалося створити пост");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className={`${s.card} card`}>
      <div className={s.head}>
        <div className={s.title}>Створити пост</div>
        <div className={`${s.counter} ${tooLong ? s.bad : ""}`}>
          {left}
        </div>
      </div>

      <form onSubmit={submit}>
        <textarea
          className={s.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Що нового? Напиши коротко і по суті…"
          rows={4}
        />

        {error && <div className="error">Помилка: {String(error)}</div>}

        <div className={s.actions}>
          <button className="btn-primary" type="submit" disabled={!canSubmit}>
            {status === "loading" ? "Публікую…" : "Опублікувати"}
          </button>

          <button
            className="btn-ghost"
            type="button"
            onClick={() => setText("")}
            disabled={status === "loading" || text.length === 0}
          >
            Очистити
          </button>
        </div>
      </form>
    </div>
  );
}
