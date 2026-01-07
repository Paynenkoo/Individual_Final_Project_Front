import React from "react";
import s from "./FollowersList.module.scss";

export default function FollowersList({ title, items, onFollow, onUnfollow, myFollowing = [] }) {
  const followingSet = new Set((myFollowing || []).map(String));

  return (
    <div className={s.wrap}>
      <h3>{title}</h3>
      {(!items || items.length === 0) ? (
        <div className={s.empty}>Порожньо</div>
      ) : (
        <ul className={s.list}>
          {items.map((u) => {
            const isFollowing = followingSet.has(String(u.id));
            return (
              <li key={u.id} className={s.item}>
                <div className={s.avatar}>{u.avatar ? <img src={u.avatar} alt={u.username}/> : (u.username || "U").slice(0,2).toUpperCase()}</div>
                <div className={s.info}>
                  <div className={s.username}>@{u.username}</div>
                  <div className={s.bio}>{u.bio || "—"}</div>
                </div>
                <div className={s.actions}>
                  {isFollowing ? (
                    <button onClick={() => onUnfollow?.(u.id)}>Відписатися</button>
                  ) : (
                    <button onClick={() => onFollow?.(u.id)}>Підписатися</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
