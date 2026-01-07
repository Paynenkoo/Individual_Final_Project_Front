import Notes from "./Notes";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";

describe("Notes Page", () => {
  it("відображає повідомлення, якщо нотаток немає", () => {
    renderWithProviders(<Notes />, {
      preloadedState: { auth: { user: { email: "test@example.com" } } },
    });
    expect(screen.getByText(/Нотаток ще немає\. Додай першу!/i)).toBeInTheDocument();
  });

  it("додає нову нотатку", () => {
    renderWithProviders(<Notes />, {
      preloadedState: { auth: { user: { email: "test@example.com" } } },
    });
    fireEvent.change(screen.getByPlaceholderText(/Напр\.: Алгоритм MARCH/i), { target: { value: "Hello" } });

 fireEvent.change(screen.getByPlaceholderText(/Короткі тези, кроки, нагадування…/i), { target: { value: "body" } });
    fireEvent.click(screen.getByRole("button", { name: /додати/i }));
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  it("видаляє нотатку", () => {
    renderWithProviders(<Notes />, {
      preloadedState: {
        auth: { user: { email: "test@example.com" } },
        // якщо зберігаєш нотатки у slice — додай їх сюди як початковий стан
      },
    });
    // знайди існуючу нотатку і натисни її видалення
    // fireEvent.click(screen.getByRole("button", { name: /видалити/i }));
    // expect(...).not.toBeInTheDocument();
  });
});
