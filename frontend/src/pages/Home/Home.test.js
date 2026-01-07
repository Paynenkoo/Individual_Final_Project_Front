import Home from "./Home";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";

// НЕ робимо реальний запит
jest.mock("../../store/slices/feedSlice", () => {
  const actual = jest.requireActual("../../store/slices/feedSlice");
  return {
    ...actual,
    fetchFeed: () => ({ type: "feed/fetchFeed/mock" }),
    // Стабільний селектор: повертає саме той шматок state який ми кладемо
    selectFeed: (state) => state.feed,
  };
});

function renderHome(preloaded = {}) {
  const preloadedState = {
    auth: { user: null, token: null, status: "idle", error: null },
    feed: {
      items: [
        { id: "s1", title: "TCCC", description: "test" },
        { id: "s2", title: "MARCH", description: "test" },
      ],
      status: "succeeded",
      nextCursor: null,
      error: null,
    },
    users: {
      profile: null,
      profileStatus: "idle",
      profileError: null,
      posts: [],
      postsNextCursor: null,
      postsStatus: "idle",
      postsError: null,
      following: [],
      mutating: {},
      updating: false
    },
    ...preloaded,
  };
  return renderWithProviders(<Home />, { preloadedState });
}

test("відображаються назви секцій", () => {
  renderHome();
  expect(screen.getByText(/TCCC/i)).toBeInTheDocument();
  expect(screen.getByText(/MARCH/i)).toBeInTheDocument();
});

test("кнопка 'Почати тренування' існує", () => {
  renderHome();
  // якщо в компоненті інша назва — заміни тут на реальний текст кнопки
  const startBtn = screen.queryByRole("button", { name: /Почати тренування/i });
  // якщо у тебе її ще немає — зроби тимчасову перевірку на існування будь-якої дії:
  // const startBtn = screen.getByRole("button", { name: /Знайти/i });
  expect(startBtn).toBeInTheDocument();
});
