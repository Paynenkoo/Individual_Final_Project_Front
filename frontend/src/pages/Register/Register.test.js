import React from "react";
import { renderWithProviders } from "../../test-utils";
import { screen } from "@testing-library/react";
import Register from "./Register"; // або Login

test("render form", () => {
  renderWithProviders(<Register />, { preloadedState: { auth: { user: null } } });
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
});
