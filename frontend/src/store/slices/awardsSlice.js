import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAwards, createAward, updateAward, deleteAward } from "../../api/awards";

// завантажити список
export const loadAwards = createAsyncThunk("awards/load", async () => {
  return await fetchAwards();
});

// створити
export const addAward = createAsyncThunk("awards/add", async (payload) => {
  return await createAward(payload);
});

// оновити
export const editAward = createAsyncThunk(
  "awards/edit",
  async ({ id, payload }) => {
    return await updateAward(id, payload);
  }
);

// видалити
export const removeAward = createAsyncThunk("awards/remove", async (id) => {
  return await deleteAward(id);
});

const slice = createSlice({
  name: "awards",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadAwards.pending, (st) => {
      st.status = "loading";
    })
      .addCase(loadAwards.fulfilled, (st, { payload }) => {
        st.status = "succeeded";
        st.list = payload || [];
      })
      .addCase(loadAwards.rejected, (st, a) => {
        st.status = "failed";
        st.error = a.error?.message || "error";
      })
      .addCase(addAward.fulfilled, (st, { payload }) => {
        st.list.unshift(payload);
      })
      .addCase(editAward.fulfilled, (st, { payload }) => {
        const i = st.list.findIndex(
          (x) => x.id === payload.id || x._id === payload._id
        );
        if (i >= 0) st.list[i] = payload;
      })
      .addCase(removeAward.fulfilled, (st, { meta }) => {
        const id = meta.arg;
        st.list = st.list.filter((x) => (x.id || x._id) !== id);
      });
  },
});

export default slice.reducer;
export const selectAwards = (st) => st.awards.list;
