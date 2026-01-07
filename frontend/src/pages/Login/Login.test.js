import Login from "./Login";
import { renderWithProviders } from "../../test-utils";
import { screen } from "@testing-library/react";

test("render form", () => {
  renderWithProviders(<Login />, { preloadedState: { auth: { user: null } } });
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
