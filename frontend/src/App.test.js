import { render, screen } from '@testing-library/react';
import { renderWithProviders } from "./test-utils";
import App from './App';

test("renders app without crash", () => {
  renderWithProviders(<App />);
});
