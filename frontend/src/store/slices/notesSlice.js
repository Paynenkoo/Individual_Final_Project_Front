import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "notes",
  initialState: { list: [] },
  reducers: { setNotes(st, { payload }) { st.list = payload || []; } }
});

export const { setNotes } = slice.actions;
export default slice.reducer;
