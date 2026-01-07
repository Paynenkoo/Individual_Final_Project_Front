import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchUserProfile = createAsyncThunk(
  "users/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити профіль");
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  "users/fetchUserPosts",
  async ({ userId, before = null }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}/posts`, {
        params: { limit: 10, ...(before ? { before } : {}) },
      });
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const nextCursor = data?.nextCursor ?? null;
      return { items, nextCursor };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося завантажити пости");
    }
  }
);

export const fetchMyFollowing = createAsyncThunk(
  "users/fetchMyFollowing",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/me/following");
      return Array.isArray(data?.following) ? data.following : [];
    } catch {
      // не валимо сторінку — повертаємо порожній список
      return [];
    }
  }
);

export const updateMe = createAsyncThunk(
  "users/updateMe",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/users/me", payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося оновити профіль");
    }
  }
);

export const followUser = createAsyncThunk(
  "users/followUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/follow`);
      return userId;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося підписатися");
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "users/unfollowUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/unfollow`);
      return userId;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "Не вдалося відписатися");
    }
  }
);

const slice = createSlice({
  name: "users",
  initialState: {
    // додано для юніт-тестів usersSlice
    list: [],

    profile: null,
    profileStatus: "idle",
    profileError: null,

    posts: [],
    postsNextCursor: null,
    postsStatus: "idle",
    postsError: null,

    following: [],
    mutating: {},
    updating: false,
  },
  reducers: {
    resetUserPosts(state) {
      state.posts = [];
      state.postsNextCursor = null;
      state.postsStatus = "idle";
      state.postsError = null;
    },
    // додано: щоб тести могли робити reducer(prev, setUsers(...))
    setUsers(state, action) {
      state.list = action.payload || [];
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchUserProfile.pending, (s) => {
      s.profileStatus = "loading"; s.profileError = null;
    });
    b.addCase(fetchUserProfile.fulfilled, (s, a) => {
      s.profileStatus = "succeeded"; s.profile = a.payload;
    });
    b.addCase(fetchUserProfile.rejected, (s, a) => {
      s.profileStatus = "failed"; s.profileError = a.payload || a.error.message;
    });

    b.addCase(fetchUserPosts.pending, (s) => { s.postsStatus = "loading"; });
    b.addCase(fetchUserPosts.fulfilled, (s, a) => {
      const { items, nextCursor } = a.payload || {};
      if (s.posts.length === 0 || s.postsNextCursor === null) {
        s.posts = items || [];
      } else {
        s.posts = s.posts.concat(items || []);
      }
      s.postsNextCursor = nextCursor || null;
      s.postsStatus = "succeeded";
    });
    b.addCase(fetchUserPosts.rejected, (s, a) => {
      s.postsStatus = "failed";
      s.postsError = a.payload || a.error.message;
    });

    b.addCase(fetchMyFollowing.fulfilled, (s, a) => {
      s.following = Array.isArray(a.payload) ? a.payload : [];
    });

    b.addCase(updateMe.pending, (s) => { s.updating = true; });
    b.addCase(updateMe.fulfilled, (s, a) => { s.updating = false; s.profile = a.payload; });
    b.addCase(updateMe.rejected, (s) => { s.updating = false; });

    b.addCase(followUser.pending, (s, a) => { s.mutating[a.meta.arg] = true; });
    b.addCase(followUser.fulfilled, (s, a) => {
      const id = String(a.payload);
      if (!s.following.includes(id)) s.following.push(id);
      s.mutating[id] = false;
    });
    b.addCase(followUser.rejected, (s, a) => { s.mutating[a.meta.arg] = false; });

    b.addCase(unfollowUser.pending, (s, a) => { s.mutating[a.meta.arg] = true; });
    b.addCase(unfollowUser.fulfilled, (s, a) => {
      const id = String(a.payload);
      s.following = s.following.filter((x) => x !== id);
      s.mutating[id] = false;
    });
    b.addCase(unfollowUser.rejected, (s, a) => { s.mutating[a.meta.arg] = false; });
  },
});

// СЕЛЕКТОРИ + ЕКСПОРТИ
export const { resetUserPosts, setUsers } = slice.actions;
export const selectUsersState = (s) => s.users || {};
export default slice.reducer;
