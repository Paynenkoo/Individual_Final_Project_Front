// frontend/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import bazilkaReducer from "./slices/bazilkaSlice";
import quizzesReducer from "./slices/quizzesSlice";
import notesReducer from "./slices/notesSlice";
import feedReducer from "./slices/feedSlice";
import searchReducer from "./slices/searchSlice";
import usersReducer from "./slices/usersSlice";
import awardsReducer from "./slices/awardsSlice";
import followersReducer from "./slices/followersSlice";
import postsReducer from "./slices/postsSlice";
import commentsReducer from "./slices/commentsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bazilka: bazilkaReducer,
    quizzes: quizzesReducer,
    notes: notesReducer,
    feed: feedReducer,
    search: searchReducer,
    users: usersReducer,
    awards: awardsReducer,
    followers: followersReducer,
    posts: postsReducer,
    comments: commentsReducer,
  },
});

export default store;
