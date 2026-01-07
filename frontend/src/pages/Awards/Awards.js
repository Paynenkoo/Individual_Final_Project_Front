import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadAwards,
  addAward,
  editAward,
  removeAward,
  selectAwards,
} from "../../store/slices/awardsSlice";
import AwardCard from "../../components/AwardCard/AwardCard";
import s from "./Awards.module.scss";

export default function Awards() {
  const dispatch = useDispatch();
  const awards = useSelector(selectAwards);
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    dispatch(loadAwards());
  }, [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await dispatch(addAward(form));
    setForm({ title: "", description: "" });
  };

  return (
    <div className={s.wrap}>
      <h1>Awards</h1>

      <form className={s.form} onSubmit={submit}>
        <input
          placeholder="Назва цілі"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Опис"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">Додати</button>
      </form>

      <div className={s.list}>
        {awards.map((a) => (
          <AwardCard
            key={a._id || a.id}
            award={a}
            onEdit={(aw) =>
              dispatch(
                editAward({
                  id: aw._id || aw.id,
                  payload: { title: aw.title + " (upd)" },
                })
              )
            }
            onDelete={(aw) => dispatch(removeAward(aw._id || aw.id))}
          />
        ))}
      </div>
    </div>
  );
}
