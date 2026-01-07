import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserOverview, getMe } from "../../api/users";
import Post from "../../components/Post/Post";
import AwardCard from "../../components/AwardCard/AwardCard";
import s from "./Account.module.scss";

export default function Account() {
  const { id } = useParams(); // /account/:id  (id може бути 'me' | ObjectId | username)
  const [state, setState] = useState({ loading: true, err: null, data: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, err: null }));

        let key = id;
        if (!key || key === "me") {
          const me = await getMe();
          key = me?._id || me?.id || me?.username;
          if (!key) throw new Error("Не вдалося визначити ваш ID");
        }

        const data = await getUserOverview(key);
        if (!alive) return;
        setState({ loading: false, err: null, data });
      } catch (err) {
        if (!alive) return;
        setState({
          loading: false,
          err: err?.response?.data?.message || err?.message || "Помилка",
          data: null,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const user = state.data?.user;
  const posts = state.data?.posts || [];
  const awards = state.data?.awards || [];

  const initials = useMemo(() => (user?.username || "U").slice(0, 2).toUpperCase(), [user]);

  if (state.loading) return <div className={s.wrap}>Завантаження…</div>;
  if (state.err) return <div className={s.wrap}>Помилка: {state.err}</div>;
  if (!user) return <div className={s.wrap}>Користувача не знайдено</div>;

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div className={s.avatar}>
          {user.avatar ? <img src={user.avatar} alt={user.username} /> : <span>{initials}</span>}
        </div>
        <div className={s.info}>
          <div className={s.username}>{user.username}</div>
          <div className={s.bio}>{user.bio || "—"}</div>
          <div className={s.stats}>
            <span>Followers: {user.followersCount}</span>
            <span>Following: {user.followingCount}</span>
            <span>Posts: {user.postsCount}</span>
            <span>Awards: {user.awardsCount}</span>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <h2>Досягнення</h2>
        {awards.length === 0 ? (
          <div className={s.empty}>Поки що немає досягнень</div>
        ) : (
          <div className={s.awards}>
            {awards.map((a) => (
              <AwardCard key={a._id || a.id} award={a} />
            ))}
          </div>
        )}
      </div>

      <div className={s.section}>
        <h2>Публікації</h2>
        {posts.length === 0 ? (
          <div className={s.empty}>Поки що немає публікацій</div>
        ) : (
          <div className={s.posts}>
            {posts.map((p) => (
              <Post key={p._id || p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
