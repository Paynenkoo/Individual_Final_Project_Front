// frontend/src/pages/Bazilka/__tests__/Bazilka.ui.test.jsx
import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import bazilkaReducer, { deletePost } from "../../../store/slices/bazilkaSlice";
import Bazilka from "../../../pages/Bazilka/Bazilka";
import { act, waitFor } from "@testing-library/react";




beforeAll(() => {
  jest.spyOn(window, "confirm").mockReturnValue(true);
});

afterAll(() => {
  window.confirm.mockRestore();
});

const flushPromises = () => new Promise(setImmediate);

await act(async () => {
  fireEvent.click(screen.getByRole("button", { name: /редагувати/i }));
});

await act(async () => {
  fireEvent.change(screen.getByRole("textbox", { name: /текст/i }), { target: { value: "Новий текст" } });
  fireEvent.click(screen.getByRole("button", { name: /зберегти/i }));
  await flushPromises();
});

await waitFor(() =>
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({ type: editComment.pending.type, meta: expect.any(Object) })
  )
);


jest.mock("../../../store/slices/bazilkaSlice", () => {
  const original = jest.requireActual("../../../store/slices/bazilkaSlice");
  return {
    __esModule: true,
    ...original,
    fetchPosts: () => ({ type: "__noop__" }),
  };
});

function renderWithStore(preloaded) {
  const store = configureStore({
    reducer: {
      bazilka: bazilkaReducer,
      auth: (state = preloaded.auth) => state, // простий ред'юсер для user
    },
    preloadedState: preloaded,
  });

  const ui = render(
    <Provider store={store}>
      <MemoryRouter>
        <Bazilka />
      </MemoryRouter>
    </Provider>
  );
  return { store, ...ui };
}

test("renders Bazilka title and shows delete button for owner", () => {
  const preloaded = {
    auth: { user: { id: "u1", username: "Me" } },
    bazilka: {
      items: [
        {
          _id: "post1",
          authorId: "u1",
          authorName: "Me",
          topic: "Мій пост",
          text: "Текст",
          createdAt: new Date().toISOString(),
          likedBy: [],
          comments: [],
          __likesCount: 0,
          _comments: 0,
        },
      ],
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

  const { store } = renderWithStore(preloaded);

  expect(screen.getByText("Базілка")).toBeInTheDocument();

  const delBtn = screen.getByTitle("Видалити пост");
  expect(delBtn).toBeInTheDocument();

  const spy = jest.spyOn(store, "dispatch");
  fireEvent.click(delBtn);
  // очікуємо, що піде action deletePost
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: deletePost.pending.type, meta: expect.any(Object) }));
});
