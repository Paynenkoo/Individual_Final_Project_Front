import React from "react";
import s from "./Comment.module.scss";

export default function Comment({ comment }){
  if(!comment) return null;
  return (
    <div className={s.row}>
      <div className={s.avatar}>{(comment.author?.username||"U").slice(0,1).toUpperCase()}</div>
      <div className={s.bubble}>
        <div className={s.header}>
          <span className={s.author}>{comment.author?.username||"User"}</span>
          <span className={s.date}>{new Date(comment.createdAt||Date.now()).toLocaleString()}</span>
        </div>
        <div>{comment.content}</div>
      </div>
    </div>
  );
}
