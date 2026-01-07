// frontend/src/store/slices/bazilkaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBazilka as apiFetchBazilka,
  createPost as apiCreatePost,
  addComment as apiAddComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
  deletePost as apiDeletePost,
  toggleLike as apiToggleLike,
} from "../../api/bazikalka";

// ─────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────

export const fetchPosts = createAsyncThunk(
  "bazilka/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetchBazilka({ limit: 10 }); // { items, nextCursor }
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося завантажити пости");
    }
  }
);

export const fetchMorePosts = createAsyncThunk(
  "bazilka/fetchMorePosts",
  async (_, { getState, rejectWithValue }) => {
    try {
      const cursor = getState().bazilka.nextCursor;
      if (!cursor) return { items: [], nextCursor: null };
      const data = await apiFetchBazilka({ limit: 10, before: cursor });
      return data;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося завантажити ще пости");
    }
  }
);

export const createPost = createAsyncThunk(
  "bazilka/createPost",
  async ({ topic, text }, { rejectWithValue }) => {
    try {
      const post = await apiCreatePost({ topic, text });
      return post;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося створити пост");
    }
  }
);

export const addComment = createAsyncThunk(
  "bazilka/addComment",
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const updatedPost = await apiAddComment(id, text); // бек повертає оновлений пост
      return { postId: id, updatedPost };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося додати коментар");
    }
  }
);

export const editComment = createAsyncThunk(
  "bazilka/editComment",
  async ({ postId, commentId, text }, { rejectWithValue }) => {
    try {
      const updatedPost = await apiUpdateComment(postId, commentId, text);
      return { postId, commentId, updatedPost };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося оновити коментар");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "bazilka/deleteComment",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const res = await apiDeleteComment(postId, commentId);
      return { postId, commentId, updatedPost: res?.updatedPost || null };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося видалити коментар");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "bazilka/toggleLike",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const data = await apiToggleLike(postId); // { liked, likesCount }
      const uid = getState()?.auth?.user?.id || null;
      return { postId, liked: data.liked, likesCount: data.likesCount, uid };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося змінити лайк");
    }
  }
);

export const deletePost = createAsyncThunk(
  "bazilka/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await apiDeletePost(postId);
      return postId;
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || "Не вдалося видалити пост");
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────

const initialState = {
  items: [],
  nextCursor: null,
  status: "idle",
  error: null,

  loadingMore: false,
  creating: false,
  commentingById: {},       // { [postId]: true }
  likingById: {},           // { [postId]: true }
  deletingById: {},         // { [postId]: true }
  deletingCommentById: {},  // { [commentId]: true }
  editingCommentById: {},   // { [commentId]: true }
};

const slice = createSlice({
  name: "bazilka",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    // fetchPosts
    b.addCase(fetchPosts.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchPosts.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.items = normalizePosts(a.payload?.items || []);
      s.nextCursor = a.payload?.nextCursor || null;
    });
    b.addCase(fetchPosts.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload || a.error.message;
    });

    // fetchMorePosts
    b.addCase(fetchMorePosts.pending, (s) => { s.loadingMore = true; });
    b.addCase(fetchMorePosts.fulfilled, (s, a) => {
      s.loadingMore = false;
      const more = normalizePosts(a.payload?.items || []);
      const seen = new Set(s.items.map((p) => String(p._id)));
      const merged = [...s.items];
      for (const p of more) {
        if (!seen.has(String(p._id))) merged.push(p);
      }
      s.items = merged;
      s.nextCursor = a.payload?.nextCursor || null;
    });
    b.addCase(fetchMorePosts.rejected, (s, a) => {
      s.loadingMore = false;
      s.error = a.payload || a.error.message;
    });

    // createPost
    b.addCase(createPost.pending, (s) => { s.creating = true; });
    b.addCase(createPost.fulfilled, (s, a) => {
      s.creating = false;
      s.items.unshift(normalizePost(a.payload));
    });
    b.addCase(createPost.rejected, (s, a) => {
      s.creating = false;
      s.error = a.payload || a.error.message;
    });

    // addComment
    b.addCase(addComment.pending, (s, a) => {
      const postId = a.meta?.arg?.id;
      if (postId) s.commentingById[postId] = true;
    });
    b.addCase(addComment.fulfilled, (s, a) => {
      const { postId, updatedPost } = a.payload || {};
      if (postId) delete s.commentingById[postId];
      if (!postId) return;
      const idx = s.items.findIndex((p) => String(p._id) === String(postId));
      if (idx >= 0) {
        if (updatedPost) s.items[idx] = normalizePost(updatedPost);
        else s.items[idx]._comments = (s.items[idx]._comments || 0) + 1;
      }
    });
    b.addCase(addComment.rejected, (s, a) => {
      const postId = a.meta?.arg?.id;
      if (postId) delete s.commentingById[postId];
      s.error = a.payload || a.error.message;
    });

    // editComment
    b.addCase(editComment.pending, (s, a) => {
      const cid = a.meta?.arg?.commentId;
      if (cid) s.editingCommentById[cid] = true;
    });
    b.addCase(editComment.fulfilled, (s, a) => {
      const { postId, updatedPost, commentId } = a.payload || {};
      if (commentId) delete s.editingCommentById[commentId];
      const idx = s.items.findIndex((p) => String(p._id) === String(postId));
      if (idx >= 0 && updatedPost) s.items[idx] = normalizePost(updatedPost);
    });
    b.addCase(editComment.rejected, (s, a) => {
      const cid = a.meta?.arg?.commentId;
      if (cid) delete s.editingCommentById[cid];
      s.error = a.payload || a.error.message;
    });

    // deleteComment
    b.addCase(deleteComment.pending, (s, a) => {
      const cid = a.meta?.arg?.commentId;
      if (cid) s.deletingCommentById[cid] = true;
    });
    b.addCase(deleteComment.fulfilled, (s, a) => {
      const { postId, commentId, updatedPost } = a.payload || {};
      if (commentId) delete s.deletingCommentById[commentId];
      const idx = s.items.findIndex((p) => String(p._id) === String(postId));
      if (idx >= 0) {
        if (updatedPost) {
          s.items[idx] = normalizePost(updatedPost);
        } else {
          s.items[idx].comments = (s.items[idx].comments || []).filter(
            (c) => String(c._id) !== String(commentId)
          );
          s.items[idx]._comments = Math.max(0, (s.items[idx]._comments || 0) - 1);
        }
      }
    });
    b.addCase(deleteComment.rejected, (s, a) => {
      const cid = a.meta?.arg?.commentId;
      if (cid) delete s.deletingCommentById[cid];
      s.error = a.payload || a.error.message;
    });

    // toggleLike
    b.addCase(toggleLike.pending, (s, a) => {
      const postId = a.meta?.arg;
      if (postId) s.likingById[postId] = true;
    });
    b.addCase(toggleLike.fulfilled, (s, a) => {
      const { postId, likesCount, liked, uid } = a.payload || {};
      if (postId) delete s.likingById[postId];
      const idx = s.items.findIndex((p) => String(p._id) === String(postId));
      if (idx >= 0) {
        const post = s.items[idx];
        post.__likesCount =
          typeof likesCount === "number"
            ? likesCount
            : post.__likesCount ?? (post.likedBy?.length || 0);

        if (uid) {
          if (!Array.isArray(post.likedBy)) post.likedBy = [];
          const i = post.likedBy.findIndex((x) => String(x) === String(uid));
          if (liked && i === -1) post.likedBy.push(uid);
          if (!liked && i !== -1) post.likedBy.splice(i, 1);
        }
      }
    });
    b.addCase(toggleLike.rejected, (s, a) => {
      const postId = a.meta?.arg;
      if (postId) delete s.likingById[postId];
      s.error = a.payload || a.error.message;
    });

    // deletePost
    b.addCase(deletePost.pending, (s, a) => {
      const postId = a.meta?.arg;
      if (postId) s.deletingById[postId] = true;
    });
    b.addCase(deletePost.fulfilled, (s, a) => {
      const id = a.payload;
      s.items = s.items.filter((p) => String(p._id) !== String(id));
      delete s.deletingById[id];
    });
    b.addCase(deletePost.rejected, (s, a) => {
      const id = a.meta?.arg;
      if (id) delete s.deletingById[id];
      s.error = a.payload || a.error.message;
    });
  },
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function normalizePost(p) {
  const likes = Array.isArray(p.likedBy) ? p.likedBy.length : (p.likesCount ?? 0);
  const comments = Array.isArray(p.comments) ? p.comments.length : 0;
  return {
    ...p,
    __likesCount: typeof p.__likesCount === "number" ? p.__likesCount : likes,
    _comments: typeof p._comments === "number" ? p._comments : comments,
  };
}
function normalizePosts(arr) {
  return (arr || []).map(normalizePost);
}

// ─────────────────────────────────────────────────────────────
// Selectors / Reducer
// ─────────────────────────────────────────────────────────────
export const selectBazilka = (s) => s.bazilka;
export default slice.reducer;
