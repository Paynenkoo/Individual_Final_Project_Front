import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Awards from './Awards';

const mockStore = configureStore([]);

test('renders Awards header', () => {
  const store = mockStore({ awards: { list: [], status: 'idle' } });
  render(
    <Provider store={store}>
      <Awards />
    </Provider>
  );
  expect(screen.getByText(/Awards/i)).toBeInTheDocument();
});

jest.mock("../../store/slices/awardsSlice", () => {
  const original = jest.requireActual("../../store/slices/awardsSlice");
  return {
    ...original,
    loadAwards: () => ({ type: "awards/loadAwards/dummy" }), // глушимо реальний thunk
  };
});
