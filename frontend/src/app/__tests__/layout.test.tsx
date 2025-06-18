import { render, screen } from '@testing-library/react'
import RootLayout from '../layout'

// Mock all dependencies
jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'mocked-geist-sans' }),
  Geist_Mono: () => ({ variable: 'mocked-geist-mono' })
}))

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('../components/navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>
}))

describe('RootLayout', () => {
  it('renders children in main element', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })
}) 