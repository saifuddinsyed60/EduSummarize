import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Add TextEncoder/TextDecoder for Next.js
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock global URL for test environment
class MockURL {
  href: string
  constructor(url: string) {
    this.href = url
  }
  static createObjectURL = jest.fn(() => 'blob:mock')
  static revokeObjectURL = jest.fn()
}

// Set up URL mock for both global and window contexts
global.URL = MockURL as any
Object.defineProperty(window, 'URL', {
  value: MockURL,
  writable: true,
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => ({
    get: (param: string) => {
      switch (param) {
        case 'videoUrl':
          return 'https://youtube.com/watch?v=123'
        case 'transcript':
          return '[00:00] Test transcript\n[00:30] Another line'
        case 'summary':
          return '- **[00:00]** Test summary\n- **[00:30]** Another point'
        default:
          return null
      }
    },
  }),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

// Suppress React 18 console warnings
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('Warning: React.createFactory()'))
  ) {
    return
  }
  originalError.call(console, ...args)
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
}) 