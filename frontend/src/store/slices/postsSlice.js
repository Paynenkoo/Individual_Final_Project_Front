import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "posts",
  initialState: { list: [] },
  reducers: { setPosts(st, { payload }) { st.list = payload || []; } }
});

export const { setPosts } = slice.actions;
export default slice.reducer;
export const selectPosts = (st) => st.posts.list;
