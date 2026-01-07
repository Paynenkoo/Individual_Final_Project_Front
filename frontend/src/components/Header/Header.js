import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuthUser } from "../../store/slices/authSlice";
import styles from "./Header.module.scss";



export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);
  const closeDrop = () => setDropOpen(false);

  useEffect(() => {
    function onDocClick(e) {
      if (!userRef.current) return;
      if (!userRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onLogout = async () => {
    try {
      await dispatch(logout());
    } finally {
      closeDrop();
      closeMenu();
      navigate("/login");
    }
  };

  const initials = (user?.username || user?.email || "U").slice(0, 2).toUpperCase();
  const uid = user ? (user._id || user.id || user.username) : null;


  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/" onClick={closeMenu}>⚕ TacticalMed</Link>
      </div>

      {}
      <button
        type="button"
        className={styles.burger}
        aria-label="Перемкнути меню"
        aria-controls="main-nav"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        ☰
      </button>

      {}
      <nav id="main-nav" className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
        <NavLink end to="/" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
          Головна
        </NavLink>

        <NavLink to="/guides" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
          Гайди
        </NavLink>

        <NavLink to="/quizzes" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
          Тренування
        </NavLink>

        <NavLink to="/notes" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
          Нотатки
        </NavLink>

        <NavLink to="/bazilka" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
          Базікалка
        </NavLink>
        <NavLink to="/awards" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
  Досягнення
</NavLink>

        {}
        <div className={styles.right}>
          {user ? (
            <div className={styles.user} ref={userRef}>
              <button
                type="button"
                className={styles.userBtn}
                aria-haspopup="menu"
                aria-expanded={dropOpen}
                onClick={() => setDropOpen((v) => !v)}
              >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.username}>{user.username || user.email}</span>
                <span className={styles.caret}>▾</span>
              </button>
{dropOpen && (
  <div className={styles.dropdown} role="menu">
    {uid && (
      <Link
        to={`/account/${uid}`}
        className={styles.item}
        onClick={() => {
          closeDrop();
          closeMenu();
        }}
      >
        Мій акаунт
      </Link>
    )}

    {uid && (
      <Link
        to={`/progress/${uid}`}
        className={styles.item}
        onClick={() => {
          closeDrop();
          closeMenu();
        }}
      >
        Прогрес
      </Link>
    )}

    <Link
      to="/notes"
      className={styles.item}
      onClick={() => {
        closeDrop();
        closeMenu();
      }}
    >
      Мої нотатки
    </Link>

    <button
      type="button"
      className={`${styles.item} ${styles.logout}`}
      onClick={onLogout}
    >
      Вийти
    </button>
  </div>
)}



            </div>
          ) : (
            <div className={styles.authGroup}>
              <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
                Увійти
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? styles.active : "")} onClick={closeMenu}>
                Реєстрація
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
