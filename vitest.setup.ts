import '@testing-library/jest-dom'

// Mock para window.URL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

// Mock para document.createElement
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName) => {
  const element = originalCreateElement.call(document, tagName);
  if (tagName === 'a') {
    element.click = vi.fn();
    element.download = '';
  }
  return element;
});

// Mock para console methods para evitar spam en tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};