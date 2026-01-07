// frontend/src/pages/Logout/Logout.js
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // очищаємо Redux і localStorage
    dispatch(logout());
    // перекидаємо на логін
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  return (
    <div className="card" style={{ maxWidth: 480, margin: "32px auto" }}>
      <h1>Вихід</h1>
      <p>Виходимо з акаунту…</p>
    </div>
  );
}
