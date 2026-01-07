import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserOverview, getMe } from "../../api/users";
import s from "./Progress.module.scss";

function Bar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={s.bar}>
      <div className={s.fill} style={{ width: `${v}%` }} />
      <span className={s.label}>{v}%</span>
    </div>
  );
}

export default function ProgressPage() {
  const { id } = useParams(); // /progress/:id  (id може бути 'me' | ObjectId | username)
  const [state, setState] = useState({ loading: true, err: null, awards: [] });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, err: null }));

        let key = id;
        if (!key || key === "me") {
          const me = await getMe(); // { _id | id | username }
          key = me?._id || me?.id || me?.username;
          if (!key) throw new Error("Не вдалося визначити ваш ID");
        }

        const data = await getUserOverview(key);
        if (!alive) return;
        setState({ loading: false, err: null, awards: data?.awards || [] });
      } catch (e) {
        if (!alive) return;
        setState({
          loading: false,
          err: e?.response?.data?.message || e?.message || "Помилка",
          awards: [],
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.loading) return <div className={s.wrap}>Завантаження…</div>;
  if (state.err) return <div className={s.wrap}>Помилка: {state.err}</div>;

  return (
    <div className={s.wrap}>
      <h1>Прогрес цілей</h1>
      {state.awards.length === 0 ? (
        <div className={s.empty}>Поки що немає цілей</div>
      ) : (
        <div className={s.list}>
          {state.awards.map((a) => (
            <div className={s.card} key={a._id}>
              <div className={s.title}>{a.title}</div>
              <div className={s.desc}>{a.description || "—"}</div>
              <Bar value={a.progress || 0} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
