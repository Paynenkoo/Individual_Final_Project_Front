import { configureStore } from "@reduxjs/toolkit";
import Bazilka from "../../../pages/Bazilka/Bazilka";
import bazilkaReducer, { editComment } from "../bazilkaSlice";


import bazilkaReducer, { editComment } from "../../bazilkaSlice";
 function makeStore(preloadedState) {
   return configureStore({ reducer: { bazilka: bazilkaReducer }, preloadedState });
 }

test("editComment → оновлює пост у state", async () => {
  const pre = {
    bazilka: {
      items: [
        {
          _id: "p1",
          authorId: "u1",
          likedBy: [],
          comments: [{ _id: "c1", authorId: "u1", text: "old" }],
          __likesCount: 0,
          _comments: 1,
        },
      ],
      nextCursor: null,
      status: "idle",
      error: null,
      loadingMore: false,
      creating: false,
      commentingById: {},
      likingById: {},
      deletingById: {},
      deletingCommentById: {},
      editingCommentById: {},
    },
  };

  const store = makeStore(pre);

  const updatedPost = {
    _id: "p1",
    authorId: "u1",
    likedBy: [],
    comments: [{ _id: "c1", authorId: "u1", text: "new text" }],
  };

  store.dispatch(
    editComment.fulfilled(
      { postId: "p1", commentId: "c1", updatedPost },
      "reqId",
      { postId: "p1", commentId: "c1", text: "new text" }
    )
  );

  const st = store.getState().bazilka;
  expect(st.items[0].comments[0].text).toBe("new text");
});
