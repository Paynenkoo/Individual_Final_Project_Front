import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { doFollow, doUnfollow, selectFollowers } from "../../store/slices/followersSlice";

export default function FollowButton({ userId }){
  const dispatch = useDispatch();
  const followers = useSelector(selectFollowers);
  const isFollowing = followers?.some(f=> (f.id||f._id) === userId);

  const toggle = ()=>{
    if(isFollowing) dispatch(doUnfollow(userId));
    else dispatch(doFollow(userId));
  };

  return (
    <button className="btn" onClick={toggle}>
      {isFollowing ? "Відписатися" : "Підписатися"}
    </button>
  );
}
