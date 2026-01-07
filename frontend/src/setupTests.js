 

import '@testing-library/jest-dom';


jest.mock("axios", () => {
    const fn = () => Promise.resolve({ data: {} });
    return {
      create: () => ({ get: fn, post: fn, delete: fn, put: fn }),
      get: fn, post: fn, delete: fn, put: fn,
    };
  });