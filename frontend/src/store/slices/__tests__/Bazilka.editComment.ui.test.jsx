// frontend/src/pages/Bazilka/__tests__/Bazilka.editComment.ui.test.jsx
import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import bazilkaReducer, { editComment } from "../../../store/slices/bazilkaSlice";
import Bazilka from "../../../pages/Bazilka/Bazilka";

// глушимо автозапит fetchPosts
jest.mock("../../../store/slices/bazilkaSlice", () => {
  const original = jest.requireActual("../../../store/slices/bazilkaSlice");
  return {
    __esModule: true,
    ...original,
    fetchPosts: () => ({ type: "__noop__" }),
  };
});

function renderWith(preloaded) {
  const store = configureStore({
    reducer: {
      bazilka: bazilkaReducer,
      auth: (state = preloaded.auth) => state,
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

test("UI: редагування коментаря відображається та диспатчить editComment", () => {
  const pre = {
    auth: { user: { id: "u1", username: "Me" } },
    bazilka: {
      items: [
        {
          _id: "p1",
          authorId: "u2",
          authorName: "Other",
          topic: "T",
          text: "X",
          createdAt: new Date().toISOString(),
          likedBy: [],
          __likesCount: 0,
          _comments: 1,
          comments: [
            {
              _id: "c1",
              authorId: "u1",
              authorName: "Me",
              text: "old",
              createdAt: new Date().toISOString(),
            },
          ],
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

  const { store } = renderWith(pre);

  // Відкриваємо деталі поста
  fireEvent.click(screen.getByRole("button", { name: "Відкрити" }));

  // Кнопка "Редагувати" повинна бути (бо автор комента = u1)
  const editBtn = screen.getByRole("button", { name: "Редагувати" });
  expect(editBtn).toBeInTheDocument();
  fireEvent.click(editBtn);

  // З’являється інпут і "Зберегти"
  const input = screen.getByPlaceholderText("Змініть текст коментаря…");
  fireEvent.change(input, { target: { value: "new text" } });

  const spy = jest.spyOn(store, "dispatch");
  const saveBtn = screen.getByRole("button", { name: "Зберегти" });
  fireEvent.click(saveBtn);

  // Перевіряємо, що пішов dispatch з типом editComment.pending
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({ type: editComment.pending.type, meta: expect.any(Object) })
  );
});
