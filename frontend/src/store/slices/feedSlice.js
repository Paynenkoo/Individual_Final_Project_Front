 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const normalize = (data) => {
  if (Array.isArray(data)) return { items: data, nextCursor: null };
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    nextCursor: data?.nextCursor ?? null,
  };
};

export const fetchFeed = createAsyncThunk(
  "feed/fetchFeed",
  async ({ q = "" } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/feed", { params: { q, limit: 10 } });
      const norm = normalize(data);
      return { q, ...norm };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити фід");
    }
  }
);

export const fetchMoreFeed = createAsyncThunk(
  "feed/fetchMoreFeed",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState().feed || {};
      const { nextCursor, q } = st;
      if (!nextCursor) return { items: [], nextCursor: null };
      const { data } = await api.get("/feed", {
        params: { q: q || "", limit: 10, before: nextCursor },
      });
      return normalize(data);
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити ще");
    }
  }
);

const slice = createSlice({
  name: "feed",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    nextCursor: null,
    loadingMore: false,
    q: "",
  },
  reducers: {
    setQuery(state, action) {
      state.q = action.payload || "";
    },
    resetFeed(state) {
      state.items = [];
      state.nextCursor = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchFeed.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchFeed.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.items = a.payload.items || [];
      s.nextCursor = a.payload.nextCursor || null;
      s.q = a.payload.q || "";
    });
    b.addCase(fetchFeed.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload || a.error.message;
    });

    b.addCase(fetchMoreFeed.pending, (s) => {
      s.loadingMore = true;
    });
    b.addCase(fetchMoreFeed.fulfilled, (s, a) => {
      s.loadingMore = false;
      const more = a.payload.items || [];
      s.items = s.items.concat(more);
      s.nextCursor = a.payload.nextCursor || null;
    });
    b.addCase(fetchMoreFeed.rejected, (s, a) => {
      s.loadingMore = false;
      s.error = a.payload || a.error.message;
    });
  },
});

export const { setQuery, resetFeed } = slice.actions;
export const selectFeed = (st) => st.feed || {};
export default slice.reducer;
