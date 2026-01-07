import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectAuthUser } from "../../store/slices/authSlice";
import s from "./Profile.module.scss";

export default function Profile() {
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initials = (user?.username || user?.email || "U")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const onLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className={s.wrap}>
      <div className={`${s.card} card`}>
        <div className={s.grid}>
          <div className={s.avatar}>{initials}</div>
          <div className={s.meta}>
            <h1>Профіль</h1>

            <div className={s.row}>
              <div className={s.muted}>Нікнейм</div>
              <div>{user?.username || "—"}</div>
            </div>

            <div className={s.row}>
              <div className={s.muted}>Email</div>
              <div>{user?.email}</div>
            </div>

            {user?.createdAt && (
              <div className={s.row}>
                <div className={s.muted}>З нами з</div>
                <div>{new Date(user.createdAt).toLocaleString()}</div>
              </div>
            )}

            <div className={s.actions}>
              <button type="button" className="btn-ghost" onClick={onLogout}>
                Вийти
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
