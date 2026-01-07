import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "../../store/slices/authSlice";
import {
  fetchBazilka,
  createPost,
  addComment,
  updateComment,
  deleteComment,
  deletePost,
  toggleLike,
} from "../../api/bazikalka";

import s from "./Post.module.scss";

export default function Post({ post, onRemoved, onCommentAdded, onCommentRemoved }) {
  const me = useSelector(selectAuthUser);
  const myId = String(me?._id || me?.id || "");
  const canDeletePost = myId && String(post.authorId) === myId;

  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");
  const [likesCount, setLikesCount] = useState(post.likedBy?.length || post.likesCount || 0);

  const handleDeletePost = async () => {
    if (!window.confirm("Видалити цей пост?")) return;
    try {
      await deletePost(post._id);
      onRemoved?.(post._id);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Не вдалося видалити пост");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    try {
      const created = await addComment(post._id, text);
      setComments((arr) => [...arr, created]);
      setNewComment("");
      onCommentAdded?.(post._id, created);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Не вдалося додати коментар");
    }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm("Видалити коментар?")) return;
    try {
      await deleteComment(post._id, cid);
      setComments((arr) => arr.filter((c) => String(c._id) !== String(cid)));
      onCommentRemoved?.(post._id, cid);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Не вдалося видалити коментар");
    }
  };

  const onLike = async () => {
    try {
      const res = await toggleLike(post._id);
      setLikesCount(res.likesCount ?? likesCount);
    } catch {}
  };

  return (
    <div className={`${s.post} card`}>
      <div className={s.header}>
        <div className={s.author}>{post.authorName}</div>
        <div className={s.meta}>
          <span className={s.topic}>{post.topic || "—"}</span>
          <span className={s.date}>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className={s.text}>{post.text}</div>

      <div className={s.actions}>
        <button className="btn-link" onClick={onLike}>❤ {likesCount}</button>
        {canDeletePost && (
          <button className="btn-link danger" onClick={handleDeletePost}>Видалити пост</button>
        )}
      </div>

      <div className={s.comments}>
        {comments.map((c) => {
          const canDeleteComment =
            myId && (String(c.authorId) === myId || String(post.authorId) === myId);
          return (
            <div key={c._id} className={s.comment}>
              <div className={s.cmeta}>
                <b>{c.authorName}</b>
                <span className={s.cdate}>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <div className={s.ctext}>{c.text}</div>
              {canDeleteComment && (
                <button
                  className="btn-link danger"
                  onClick={() => handleDeleteComment(c._id)}
                >
                  Видалити
                </button>
              )}
            </div>
          );
        })}

        <form onSubmit={handleAddComment} className={s.cform}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написати коментар…"
          />
          <button type="submit" className="btn-primary">Надіслати</button>
        </form>
      </div>
    </div>
  );
}
