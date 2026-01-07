import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMeThunk, selectAuthUser } from "../../store/slices/authSlice";
import { updateMe } from "../../api/users";
import styles from "./AccountSettings.module.scss";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Підтягнути поточного юзера, якщо його ще нема в сторі
  useEffect(() => {
    if (!user) {
      dispatch(fetchMeThunk());
    }
  }, [user, dispatch]);

  // Заповнити форму, коли юзер зʼявився
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await updateMe({
        username: username.trim(),
        bio: bio.trim(),
      });

      // Оновити юзера в Redux після успішного збереження
      await dispatch(fetchMeThunk());

      setSuccess("Дані успішно збережено ✅");
    } catch (err) {
      console.error(err);
      setError("Не вдалося зберегти зміни. Спробуй ще раз.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>Завантаження профілю…</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Налаштування акаунту</h1>
        <p className={styles.sub}>
          Тут ти можеш змінити свій нікнейм та біо.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Нікнейм</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введи свій нікнейм"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Біо</label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Коротко про себе, цілі, тренування…"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Зберігаємо..." : "Зберегти зміни"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
