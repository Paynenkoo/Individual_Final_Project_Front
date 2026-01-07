import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  fetchMorePosts,
  createPost,
  addComment,
  toggleLike,
  deletePost,
  deleteComment,
  editComment,            // ← редагування коментаря
  selectBazilka,
} from "../../store/slices/bazilkaSlice";
import { selectAuthUser } from "../../store/slices/authSlice";
import useInfiniteScroll from "./useInfiniteScroll";
import s from "./Bazilka.module.scss";

export default function Bazilka() {
  const dispatch = useDispatch();
  const {
    items,
    status,
    creating,
    commentingById,
    likingById,
    nextCursor,
    loadingMore,
    deletingById,
    deletingCommentById,
    editingCommentById,
  } = useSelector(selectBazilka);

  const user = useSelector(selectAuthUser);
  const youId = user?.id || user?._id || null;

  // Composer
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");

  // Відкриті картки постів
  const [open, setOpen] = useState(() => new Set());
  const toggleOpen = (id) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Коментування
  const [commentText, setCommentText] = useState({}); // { [postId]: "..." }

  // Редагування коментарів
  const [editMap, setEditMap] = useState({}); // { [commentId]: "draft" }
  const [editingForPost, setEditingForPost] = useState({}); // { [commentId]: postId }

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const posts = useMemo(() => {
    return items.map((p) => {
      const likesCount =
        typeof p.__likesCount === "number"
          ? p.__likesCount
          : Array.isArray(p.likedBy)
          ? p.likedBy.length
          : p.likesCount ?? 0;

      const liked = youId
        ? (p.likedBy || []).some((u) => String(u) === String(youId))
        : false;

      const commentsCount = Array.isArray(p.comments) ? p.comments.length : 0;

      return { ...p, _likes: likesCount, _liked: liked, _comments: commentsCount };
    });
  }, [items, youId]);

  // --- handlers ---

  const submitPost = async (e) => {
    e.preventDefault();
    if (!topic.trim() || !text.trim()) return;
    await dispatch(createPost({ topic: topic.trim(), text: text.trim() }));
    setTopic("");
    setText("");
  };

  const submitComment = async (postId) => {
    const t = (commentText[postId] || "").trim();
    if (!t) return;
    await dispatch(addComment({ id: postId, text: t }));
    setCommentText((m) => ({ ...m, [postId]: "" }));
  };

  const onDeletePost = async (postId) => {
    if (!window.confirm("Видалити цей пост?")) return;
    await dispatch(deletePost(postId));
  };

  const onDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Видалити цей коментар?")) return;
    await dispatch(deleteComment({ postId, commentId }));
  };

  const startEdit = (postId, comment) => {
    setEditMap((m) => ({ ...m, [comment._id]: comment.text }));
    setEditingForPost((m) => ({ ...m, [comment._id]: postId }));
  };

  const cancelEdit = (commentId) => {
    setEditMap((m) => {
      const n = { ...m };
      delete n[commentId];
      return n;
    });
    setEditingForPost((m) => {
      const n = { ...m };
      delete n[commentId];
      return n;
    });
  };

  const saveEdit = async (commentId) => {
    const newText = (editMap[commentId] || "").trim();
    const postId = editingForPost[commentId];
    if (!newText || !postId) return;
    await dispatch(editComment({ postId, commentId, text: newText }));
    cancelEdit(commentId);
  };

  // infinite scroll
  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore) return Promise.resolve();
    return dispatch(fetchMorePosts());
  }, [dispatch, nextCursor, loadingMore]);

  const sentinelRef = useInfiniteScroll({
    enabled: Boolean(nextCursor),
    loading: loadingMore || status === "loading",
    onLoadMore: loadMore,
    rootMargin: "600px",
  });

  // --- render ---

  return (
    <div className={s.wrap}>
      <h1>Базілка</h1>

      {user && (
        <form onSubmit={submitPost} className={s.composer}>
          <div className={s.row}>
            <label htmlFor="topic">Тема</label>
            <input
              id="topic"
              type="text"
              placeholder="Коротка тема повідомлення…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className={s.row}>
            <label htmlFor="text">Повідомлення</label>
            <textarea
              id="text"
              placeholder="Опишіть деталі…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div className={s.actions}>
            <button
              disabled={creating || !topic.trim() || !text.trim()}
              className="btn-primary"
            >
              {creating ? "Публікуємо…" : "Опублікувати"}
            </button>
          </div>
        </form>
      )}

      {status === "loading" && <div className={s.notice}>Завантажуємо…</div>}
      {status === "succeeded" && posts.length === 0 && (
        <div className={s.notice}>Поки порожньо. Будь першим! 🎉</div>
      )}
      {status === "failed" && (
        <div className={s.error}>Щось пішло не так. Спробуй пізніше.</div>
      )}

      <ul className={s.list}>
        {posts.map((p) => {
      const postAuthorId =
        p?.authorId || p?.author?._id || p?.author?._id?.toString?.() || null;
      const isOwner = youId && postAuthorId && String(postAuthorId) === String(youId);

          const isOpen = open.has(p._id);
          const topicTitle =
            (p.topic && p.topic.trim()) ||
            (p.text ? p.text.split("\n")[0].slice(0, 80) : "");

          return (
            <li key={p._id} className={s.card}>
              <div className={s.head}>
                <div className={s.avatar}>
                  {(p.authorName || "U").slice(0, 2).toUpperCase()}
                </div>
                <div className={s.meta}>
                  <div className={s.author}>{p.authorName}</div>
                  <div className={s.time}>
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    className={`${s.deleteBtn} btn-ghost`}
                    onClick={() => onDeletePost(p._id)}
                    disabled={!!deletingById[p._id]}
                    title="Видалити пост"
                  >
                    {deletingById[p._id] ? "…" : "✖"}
                  </button>
                )}
              </div>

              <div className={s.topic} title={topicTitle}>
                {topicTitle}
              </div>

              <div className={s.stats}>
                <button
                  className={`${s.like} ${p._liked ? s.liked : ""}`}
                  onClick={() => dispatch(toggleLike(p._id))}
                  disabled={!!likingById[p._id]}
                  title="Лайк"
                >
                  ♥ {p._likes}
                </button>
                <span className={s.commentsCount} title="Коментарі">
                  💬 {p._comments}
                </span>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => toggleOpen(p._id)}
                >
                  {isOpen ? "Згорнути" : "Відкрити"}
                </button>
              </div>

              {isOpen && (
                <div className={s.details}>
                  {p.text && <div className={s.text}>{p.text}</div>}

                  <div className={s.comments}>
                    {p.comments?.map((c) => {
                      const canDeleteComment =
                        user &&
                        (String(c.authorId) === String(youId) ||
                          String(postAuthorId) === String(youId));
                      const canEditComment =
                        user && String(c.authorId) === String(youId);
                      const isEditing = editMap[c._id] !== undefined;

                      return (
                        <div key={c._id} className={s.comment}>
                          <b>{c.authorName}</b>{" "}
                          <span className={s.commentTime}>
                            {new Date(c.createdAt).toLocaleString()}
                          </span>

                          {!isEditing ? (
                            <div className={s.commentText}>{c.text}</div>
                          ) : (
                            <div className={s.editRow}>
                              <input
                                value={editMap[c._id]}
                                onChange={(e) =>
                                  setEditMap((m) => ({
                                    ...m,
                                    [c._id]: e.target.value,
                                  }))
                                }
                                placeholder="Змініть текст коментаря…"
                              />
                              <button
                                type="button"
                                className="btn-primary"
                                onClick={() => saveEdit(c._id)}
                                disabled={
                                  !!editingCommentById?.[c._id] ||
                                  !(editMap[c._id] || "").trim()
                                }
                              >
                                {editingCommentById?.[c._id]
                                  ? "Зберігаємо…"
                                  : "Зберегти"}
                              </button>
                              <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => cancelEdit(c._id)}
                              >
                                Скасувати
                              </button>
                            </div>
                          )}

                          <div className={s.commentActions}>
                            {canEditComment && !isEditing && (
                              <button
                                type="button"
                                className="btn-link"
                                onClick={() => startEdit(p._id, c)}
                              >
                                Редагувати
                              </button>
                            )}
                            {canDeleteComment && (
                              <button
                                type="button"
                                className="btn-link danger"
                                onClick={() =>
                                  onDeleteComment(p._id, c._id)
                                }
                                disabled={!!deletingCommentById?.[c._id]}
                                title="Видалити коментар"
                              >
                                {deletingCommentById?.[c._id] ? "…" : "Видалити"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {user && (
                      <div className={s.addComment}>
                        <input
                          placeholder="Ваш коментар…"
                          value={commentText[p._id] || ""}
                          onChange={(e) =>
                            setCommentText((m) => ({
                              ...m,
                              [p._id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          onClick={() => submitComment(p._id)}
                          disabled={
                            !!commentingById[p._id] ||
                            !(commentText[p._id] || "").trim()
                          }
                        >
                          {commentingById[p._id] ? "Надсилаємо…" : "Надіслати"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div ref={sentinelRef} className={s.sentinel} />
      {nextCursor && (
        <div className={s.loader} aria-hidden={!loadingMore}>
          {loadingMore && <span className={s.spinner} />}
        </div>
      )}
    </div>
  );
}
