import Profile from "./Profile";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";

const user = { username: "Test", email: "test@example.com" };

describe("Profile Page", () => {
  it("відображає ім’я та email користувача", () => {
    renderWithProviders(<Profile />, { preloadedState: { auth: { user } } });
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("показує повідомлення, якщо користувача немає", () => {
    renderWithProviders(<Profile />, { preloadedState: { auth: { user: null } } });
    expect(screen.getByText(/користувача не знайдено/i)).toBeInTheDocument();
  });

  it("вмикає режим редагування", () => {
    renderWithProviders(<Profile />, { preloadedState: { auth: { user } } });
    fireEvent.click(screen.getByRole("button", { name: /редагувати/i }));
    expect(screen.getByRole("button", { name: /зберегти/i })).toBeInTheDocument();
  });
});
