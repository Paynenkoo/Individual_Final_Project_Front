import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { meApi } from "../../api/auth";

export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMe",
  async (_, thunkAPI) => {
    try {
      const me = await meApi();
      return me;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Не вдалося завантажити профіль";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("token");
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Помилка завантаження профілю";
        state.user = null;
      });
  },
});

export const { logout, setUser } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;

export default authSlice.reducer;
