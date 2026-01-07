import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchQuizzes = createAsyncThunk("quizzes/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/quizzes");
    return data; 
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити квізи");
  }
});

export const fetchQuizById = createAsyncThunk("quizzes/fetchById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/quizzes/${id}`);
    return data; 
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити квіз");
  }
});

export const submitQuiz = createAsyncThunk(
  "quizzes/submit",
  async ({ id, answers }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers });
      return data; 
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося відправити результат");
    }
  }
);

export const fetchMyQuizResults = createAsyncThunk("quizzes/fetchMyResults", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/quizzes/results/my?limit=20`);
    return data; 
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити історію");
  }
});

const slice = createSlice({
  name: "quizzes",
  initialState: {
    list: [],
    listStatus: "idle",
    listError: null,

    current: null,
    currentStatus: "idle",
    currentError: null,

    submitting: false,
    submitResult: null,
    submitError: null,

    myResults: [],
    myResultsStatus: "idle",
    myResultsError: null,
  },
  reducers: {
    resetSubmit(state) {
      state.submitting = false;
      state.submitResult = null;
      state.submitError = null;
    },
  },
  extraReducers: (b) => {
    
    b.addCase(fetchQuizzes.pending, (s) => { s.listStatus = "loading"; s.listError = null; });
    b.addCase(fetchQuizzes.fulfilled, (s, a) => { s.listStatus = "succeeded"; s.list = a.payload; });
    b.addCase(fetchQuizzes.rejected, (s, a) => { s.listStatus = "failed"; s.listError = a.payload || a.error.message; });

    
    b.addCase(fetchQuizById.pending, (s) => { s.currentStatus = "loading"; s.currentError = null; s.current = null; s.submitResult = null; });
    b.addCase(fetchQuizById.fulfilled, (s, a) => { s.currentStatus = "succeeded"; s.current = a.payload; });
    b.addCase(fetchQuizById.rejected, (s, a) => { s.currentStatus = "failed"; s.currentError = a.payload || a.error.message; });

    
    b.addCase(submitQuiz.pending, (s) => { s.submitting = true; s.submitError = null; s.submitResult = null; });
    b.addCase(submitQuiz.fulfilled, (s, a) => { s.submitting = false; s.submitResult = a.payload; });
    b.addCase(submitQuiz.rejected, (s, a) => { s.submitting = false; s.submitError = a.payload || a.error.message; });

    
    b.addCase(fetchMyQuizResults.pending, (s) => { s.myResultsStatus = "loading"; s.myResultsError = null; });
    b.addCase(fetchMyQuizResults.fulfilled, (s, a) => { s.myResultsStatus = "succeeded"; s.myResults = a.payload; });
    b.addCase(fetchMyQuizResults.rejected, (s, a) => { s.myResultsStatus = "failed"; s.myResultsError = a.payload || a.error.message; });
  },
});

export const { resetSubmit } = slice.actions;
export const selectQuizzes = (s) => s.quizzes;
export default slice.reducer;
