import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const searchAll = createAsyncThunk("search/searchAll", async (q, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/search", { params: { q, limit: 10 } });
    return { q, ...data };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || "Помилка пошуку");
  }
});

const slice = createSlice({
  name: "search",
  initialState: { q: "", users: [], posts: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(searchAll.pending, (s) => { s.status = "loading"; s.error = null; });
    b.addCase(searchAll.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.q = a.payload.q;
      s.users = a.payload.users || [];
      s.posts = a.payload.posts || [];
    });
    b.addCase(searchAll.rejected, (s, a) => { s.status = "failed"; s.error = a.payload || a.error.message; });
  },
});

export const selectSearch = (st) => st.search;
export default slice.reducer;
