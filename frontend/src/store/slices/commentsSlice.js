import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "comments",
  initialState: { byPost: {} },
  reducers: { setComments(st, { payload }) { st.byPost = payload || {}; } }
});

export const { setComments } = slice.actions;
export default slice.reducer;
