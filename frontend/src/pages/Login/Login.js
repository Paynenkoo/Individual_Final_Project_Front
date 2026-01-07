import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchMeThunk, selectAuthUser } from "../../store/slices/authSlice";
import { loginApi } from "../../api/auth";
import s from "./Login.module.scss";

export default function Login() {
  const [login, setLogin]       = useState(""); // email або нікнейм
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("idle");
  const [error, setError]   = useState(null);

  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Якщо вже залогінений – перекидаємо на головну
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const data = await loginApi({
        emailOrUsername: login,
        password,
      });

      // Очікуємо { token, user } від бекенда
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      // Підтягнути поточного юзера по токену
      await dispatch(fetchMeThunk()).unwrap();

      // Після логіну – на Home
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          (typeof err === "string"
            ? err
            : "Не вдалося увійти. Перевір логін і пароль.")
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className={s.wrap}>
      <form onSubmit={onSubmit} className={`${s.card} card`}>
        <h1 className={s.title}>Вхід</h1>

        <div className={s.group}>
          <div className={s.row}>
            <label htmlFor="login">Email або нікнейм</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="you@mail.com або Medic_Taras"
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
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && <div className="error">Помилка: {String(error)}</div>}

        <div className={s.actions}>
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Входимо…" : "Увійти"}
          </button>

          <span className={s.hint}>
            Немає акаунту? <Link to="/register">Зареєструватися</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
