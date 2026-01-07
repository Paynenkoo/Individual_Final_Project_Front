import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFollowers, selectFollowers } from "../../store/slices/followersSlice";
import { selectAuthUser } from "../../store/slices/authSlice";
import FollowButton from "../../components/FollowButton/FollowButton";
import s from "./FollowerList.module.scss";

export default function FollowerList(){
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const followers = useSelector(selectFollowers);

  useEffect(()=>{ if(user) dispatch(loadFollowers(user.id||user._id)); }, [dispatch, user]);

  if(!user) return <div className={s.wrap}>Авторизуйтесь</div>;

  return (
    <div className={s.wrap}>
      <h1>Follower List</h1>
      <div className={s.list}>
        {followers.map(f => (
          <div className={s.row} key={f._id||f.id}>
            <div className={s.user}>
              <div className={s.avatar}>{(f.username||"U").slice(0,2).toUpperCase()}</div>
              <div>{f.username||f.email}</div>
            </div>
            <FollowButton userId={f._id||f.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
