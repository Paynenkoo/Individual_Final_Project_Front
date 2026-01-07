import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchMeThunk, selectAuthUser } from "../../store/slices/authSlice";
import s from "./Register.module.scss";
import { registerApi } from "../../api/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("idle");
  const [error, setError]   = useState(null);

  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  // дефолт тепер на головну, а не на /profile
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // якщо уже є юзер – нема чого робити на /register
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await registerApi({ username, email, password });

      // Якщо хочеш одразу підтягувати юзера – можеш залишити це:
      // await dispatch(fetchMeThunk());

      // Після реєстрації йдемо на логін
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Не вдалося зареєструватись");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className={s.wrap}>
      <form onSubmit={onSubmit} className={`${s.card} card`}>
        <h1 className={s.title}>Реєстрація</h1>

        <div className={s.group}>
          <div className={s.row}>
            <label htmlFor="username">Нікнейм</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Медик_Тарас"
              required
            />
          </div>

          <div className={s.row}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="you@mail.com"
              required
            />
          </div>

          <div className={s.row}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && <div className="error">Помилка: {String(error)}</div>}

        <div className={s.actions}>
          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Створюємо…" : "Зареєструватись"}
          </button>

          <span className={s.hint}>
            Уже маєш акаунт? <Link to="/login">Увійти</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
