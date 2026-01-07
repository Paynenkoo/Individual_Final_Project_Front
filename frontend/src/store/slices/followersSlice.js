import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchFollowers, followUser, unfollowUser } from "../../api/followers";

export const loadFollowers = createAsyncThunk("followers/load", async (userId) => await fetchFollowers(userId));
export const doFollow = createAsyncThunk("followers/follow", async (userId) => await followUser(userId));
export const doUnfollow = createAsyncThunk("followers/unfollow", async (userId) => await unfollowUser(userId));

const slice = createSlice({
  name: "followers",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadFollowers.fulfilled, (st, { payload }) => { st.items = payload || []; st.status = "succeeded"; });
  }
});

export default slice.reducer;
export const selectFollowers = (st) => st.followers.items;
