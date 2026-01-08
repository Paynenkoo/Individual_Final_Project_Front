import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { meApi } from "../../api/auth";

export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMe",
  async (_, thunkAPI) => {
    try {
      const me = await meApi();
      return me;
    } catch (err) {
      const status = err?.response?.status;

      // ✅ Якщо просто НЕ авторизований — це не "помилка"
      if (status === 401) {
        return thunkAPI.rejectWithValue({ type: "UNAUTHORIZED" });
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Не вдалося завантажити профіль";

      return thunkAPI.rejectWithValue({ type: "ERROR", message });
    }
  }
);

const initialState = {
  user: null,
  status: "idle",   // idle | loading | succeeded | failed
  error: null,
  inited: false,    // ✅ щоб не робити fetchMe нескінченно
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      state.inited = true; // ми "ініціалізовані", просто без юзера
      localStorage.removeItem("token");
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    resetAuthError(state) {
      state.error = null;
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
        state.inited = true;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.inited = true;

        // ✅ 401 — тихо прибираємо юзера, без "червоних" помилок
        if (action.payload?.type === "UNAUTHORIZED") {
          state.status = "idle";
          state.user = null;
          state.error = null;
          localStorage.removeItem("token"); // токен протух/невалідний — чистимо
          return;
        }

        state.status = "failed";
        state.user = null;
        state.error = action.payload?.message || "Помилка завантаження профілю";
      });
  },
});

export const { logout, setUser, resetAuthError } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInited = (state) => state.auth.inited;

export default authSlice.reducer;
