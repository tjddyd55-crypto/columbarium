import { expect, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

const MockResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => {
  global.ResizeObserver = MockResizeObserver as typeof ResizeObserver;
  if (typeof window !== 'undefined') {
    window.ResizeObserver = MockResizeObserver as typeof ResizeObserver;
  }
});

afterEach(() => {
  cleanup();
});
