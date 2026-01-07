import React, { useState, useEffect } from "react";
import s from "./Notes.module.scss";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(saved);
  }, []);

  const saveNotesToStorage = (newNotes) => {
    localStorage.setItem("notes", JSON.stringify(newNotes));
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotesToStorage(updated);
    setTitle("");
    setContent("");
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotesToStorage(updated);
  };

  return (
    <div className={s.wrap}>
      <form className={`${s.form} card`} onSubmit={addNote}>
        <h1 className={s.title}>Нотатки</h1>

        <div className={s.row}>
          <label htmlFor="title">Назва</label>
          <input
            id="title"
            type="text"
            placeholder="Напр.: Алгоритм MARCH"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={s.row}>
          <label htmlFor="content">Текст</label>
          <textarea
            id="content"
            placeholder="Короткі тези, кроки, нагадування…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={s.actions}>
          <button type="submit" className="btn-primary">
            Додати нотатку
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className={s.empty}>Нотаток ще немає. Додай першу! ✍️</div>
      ) : (
        <ul className={s.grid}>
          {notes.map((note) => (
            <li key={note.id} className={`${s.noteCard} card`}>
              <div className={s.noteHeader}>
                <div className={s.noteTitle}>{note.title}</div>
                <button
                  type="button"
                  className={`${s.deleteBtn} btn-ghost`}
                  onClick={() => deleteNote(note.id)}
                  title="Видалити"
                >
                  ❌
                </button>
              </div>

              <div className={s.noteText}>{note.content}</div>
              <div className={s.noteMeta}>
                {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
