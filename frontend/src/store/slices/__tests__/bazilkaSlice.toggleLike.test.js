import { configureStore } from "@reduxjs/toolkit";
import reducer, { toggleLike } from "../bazilkaSlice";

function makeStore(preloadedState) {
  // додали простий auth reducer з user.id, бо slice оновлює likedBy з uid
  return configureStore({
    reducer: { bazilka: reducer, auth: (s = { user: { id: "u1" } }) => s },
    preloadedState,
  });
}

test("toggleLike → виставляє likesCount та додає мій uid у likedBy", () => {
  const pre = {
    bazilka: {
      items: [{ _id: "p1", likedBy: [], __likesCount: 0 }],
      nextCursor: null,
      status: "succeeded",
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

  // ⚠️ Диспатчимо fulfilled напряму, без реального API
  store.dispatch(
    toggleLike.fulfilled(
      { postId: "p1", liked: true, likesCount: 1, uid: "u1" },
      "reqId",
      "p1"
    )
  );

  const st = store.getState().bazilka;
  expect(st.items[0].__likesCount).toBe(1);
  expect(st.items[0].likedBy).toContain("u1");
});
