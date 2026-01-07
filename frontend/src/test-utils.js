// src/test-utils.js
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// підкинь сюди свої ред’юсери
import auth from "./store/slices/authSlice";
import bazilka from "./store/slices/bazilkaSlice";
import awards from "./store/slices/awardsSlice";
import feed from "./store/slices/feedSlice";
import users from "./store/slices/usersSlice";

export function renderWithProviders(ui, {
  preloadedState = {},
  store = configureStore({ reducer: { auth, bazilka, awards, feed, users }, preloadedState }),
  route = "/",
} = {}) {
  window.history.pushState({}, "Test page", route);

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
    store,
  };
}
