import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchAll, selectSearch } from "../../store/slices/searchSlice";
import { followUser, unfollowUser, selectUsersState } from "../../store/slices/usersSlice";
import { selectAuthUser } from "../../store/slices/authSlice";
import s from "./Search.module.scss";

export default function Search() {
  const dispatch = useDispatch();
  const { q, users, posts, status } = useSelector(selectSearch);
  const { following, mutating } = useSelector(selectUsersState);
  const me = useSelector(selectAuthUser);
  const [localQ, setLocalQ] = useState(q || "");

  const onSubmit = (e) => {
    e.preventDefault();
    const v = localQ.trim();
    if (!v) return;
    dispatch(searchAll(v));
  };

  const isFollowing = (id) => following.includes(String(id));

  return (
    <div className={s.wrap}>
      <form className={s.bar} onSubmit={onSubmit}>
        <input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Пошук користувачів і постів…" />
        <button className="btn-ghost" type="submit">Пошук</button>
      </form>

      <h3>Користувачі</h3>
      <div className={s.grid}>
        {users.map(u => {
          const mine = me && String(me.id) === String(u._id);
          const canFollow = me && !mine;
          const f = canFollow && isFollowing(u._id);
          return (
            <div key={u._id} className={s.card}>
              <div className={s.title}>{u.username || u.email}</div>
              <div className={s.meta}>Підписники: {u.followersCount} · Підписки: {u.followingCount}</div>
              {canFollow && (
                f ? (
                  <button className="btn-ghost" disabled={!!mutating[u._id]} onClick={() => dispatch(unfollowUser(String(u._id)))}>Відписатися</button>
                ) : (
                  <button className="btn-primary" disabled={!!mutating[u._id]} onClick={() => dispatch(followUser(String(u._id)))}>Підписатися</button>
                )
              )}
            </div>
          );
        })}
      </div>

      <h3>Пости</h3>
      <div className={s.grid}>
        {posts.map(p => (
          <div key={p._id} className={s.card}>
            <div className={s.title}>{p.topic || "Без теми"}</div>
            <div className={s.meta}>
              {p.authorName} · {new Date(p.createdAt).toLocaleString()}
            </div>
            <div className={s.row}>
              <span>♥ {p.likesCount}</span>
              <span>💬 {p.commentsCount}</span>
            </div>
          </div>
        ))}
      </div>

      {status === "loading" && <div className="notice">Шукаємо…</div>}
    </div>
  );
}
