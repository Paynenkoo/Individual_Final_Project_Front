import React from "react";
import s from "./AwardCard.module.scss";

export default function AwardCard({ award, onEdit, onDelete }){
  return (
    <div className={s.card}>
      <div className={s.row}>
        <div className={s.title}>{award.title}</div>
        <div className={s.actions}>
          {onEdit && <button onClick={()=>onEdit(award)}>Редагувати</button>}
          {onDelete && <button onClick={()=>onDelete(award)}>Видалити</button>}
        </div>
      </div>
      <div className={s.desc}>{award.description}</div>
    </div>
  );
}
