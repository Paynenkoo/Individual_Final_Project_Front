import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";

import CreatePost from "./CreatePost";

import {
  fetchFeed,
  fetchMoreFeed,
  setQuery,
  selectFeed,
} from "../../store/slices/feedSlice";
import {
  fetchMyFollowing,
  followUser,
  unfollowUser,
  selectUsersState,
} from "../../store/slices/usersSlice";
import { selectAuthUser } from "../../store/slices/authSlice";

import useInfiniteScroll from "../Bazilka/useInfiniteScroll";
import s from "./Home.module.scss";

export default function Home() {
  const dispatch = useDispatch();

  const feedState = useSelector(selectFeed, shallowEqual) || {};
  const usersState = useSelector(selectUsersState, shallowEqual) || {};
  const me = useSelector(selectAuthUser);

  const items = Array.isArray(feedState.items) ? feedState.items : [];
  const status = feedState.status || "idle";
  const nextCursor = feedState.nextCursor ?? null;
  const loadingMore = !!feedState.loadingMore;
  const q = feedState.q || "";

  const following = Array.isArray(usersState.following)
    ? usersState.following
    : [];
  const mutating = usersState.mutating || {};

  const [localQ, setLocalQ] = useState(q);

  useEffect(() => {
    dispatch(fetchFeed({ q }));
    if (me) dispatch(fetchMyFollowing());
  }, [dispatch, q, me]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return Promise.resolve();
    return dispatch(fetchMoreFeed());
  }, [dispatch, nextCursor, loadingMore]);

  const sentinelRef = useInfiniteScroll({
    enabled: Boolean(nextCursor),
    loading: loadingMore || status === "loading",
    onLoadMore: loadMore,
    rootMargin: "600px",
  });

  const onSearch = (e) => {
    e.preventDefault();
    const value = (localQ || "").trim();
    dispatch(setQuery(value));
    dispatch(fetchFeed({ q: value }));
  };

  const isFollowing = (userId) => following.includes(String(userId));

  const onCreated = () => {
    dispatch(fetchFeed({ q }));
  };

  return (
    <div className={s.wrap}>
      {me && <CreatePost onCreated={onCreated} />}

      <form className={s.searchBar} onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Пошук по темах та тексту…"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
        />
        <button className="btn-ghost" type="submit">
          Знайти
        </button>
      </form>

      {status === "loading" && <div className="notice">Завантажуємо…</div>}
      {status === "failed" && <div className="error">Помилка фіду</div>}
      {status === "succeeded" && items.length === 0 && (
        <div className="notice">Нічого не знайдено</div>
      )}

      <ul className={s.list}>
        {items.map((p) => {
          const initials = (p.authorName || "U").slice(0, 2).toUpperCase();
          const mine = me && String(p.authorId) === String(me.id);
          const canFollow = me && !mine && p.authorId;
          const followingNow = canFollow && isFollowing(String(p.authorId));

          return (
            <li key={p._id} className={s.card}>
              <div className={s.head}>
                <div className={s.avatar}>{initials}</div>
                <div className={s.meta}>
                  <div className={s.author}>
                    {p.authorId ? (
                      <Link to={`/account/${p.authorId}`}>{p.authorName}</Link>
                    ) : (
                      p.authorName
                    )}
                  </div>
                  <div className={s.time}>
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>

                {canFollow && (
                  <div className={s.followBtn}>
                    {followingNow ? (
                      <button
                        className="btn-ghost"
                        disabled={!!mutating[p.authorId]}
                        onClick={() =>
                          dispatch(unfollowUser(String(p.authorId)))
                        }
                      >
                        Відписатися
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        disabled={!!mutating[p.authorId]}
                        onClick={() => dispatch(followUser(String(p.authorId)))}
                      >
                        Підписатися
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={s.topic} title={p.topic || ""}>
                {(p.topic && p.topic.trim()) ||
                  (p.text ? p.text.split("\n")[0].slice(0, 120) : "")}
              </div>

              <div className={s.stats}>
                <span>♥ {p.likesCount ?? 0}</span>
                <span>💬 {p.commentsCount ?? 0}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} className={s.sentinel} />
    </div>
  );
}
