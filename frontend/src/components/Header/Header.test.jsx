import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import Header from "./Header";

test("renders app title", () => {
  renderWithProviders(<Header />, { preloadedState: { auth: { user: null } } });
  expect(screen.getByText(/Tactical/i)).toBeInTheDocument();
});
