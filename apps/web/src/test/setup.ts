import '@testing-library/jest-dom';

// Only apply DOM mocks when running in jsdom environment
if (typeof Element !== 'undefined') {
  // Mock pointer capture methods for Radix UI compatibility with jsdom
  // These methods are used by Radix primitives but not available in jsdom
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};

  // Mock scrollIntoView which is not available in jsdom
  Element.prototype.scrollIntoView = () => {};
}

// Mock ResizeObserver for components that use it
if (typeof global !== 'undefined' && typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
