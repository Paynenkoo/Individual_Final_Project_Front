import { configureStore } from "@reduxjs/toolkit";
import reducer, { fetchPosts, createPost } from "../bazilkaSlice";

function makeStore(preloadedState) {
  return configureStore({ reducer: { bazilka: reducer }, preloadedState });
}

test("fetchPosts → success fills items", () => {
  const store = makeStore({ bazilka: undefined });

  store.dispatch(
    fetchPosts.fulfilled(
      { items: [{ _id: "p1", topic: "Hello", likedBy: [], comments: [] }], nextCursor: null },
      "reqId",
      undefined
    )
  );

  const st = store.getState().bazilka;
  expect(st.status).toBe("succeeded");
  expect(st.items.length).toBe(1);
  expect(st.items[0].topic).toBe("Hello");
});

test("createPost → adds post on top", () => {
  const store = makeStore({
    bazilka: {
      items: [],
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
  });

  store.dispatch(
    createPost.fulfilled(
      { _id: "p2", topic: "New", likedBy: [], comments: [] },
      "reqId",
      { topic: "New", text: "Body" }
    )
  );

  const st = store.getState().bazilka;
  expect(st.items[0].topic).toBe("New");
});
