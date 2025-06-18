import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '../ThemeToggle'
import { useTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

const setTheme = jest.fn()
const useThemeMock = require('next-themes').useTheme

describe('ThemeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear()
  })

  it('renders the theme toggle button', () => {
    (useThemeMock as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme,
      resolvedTheme: 'light',
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('shows moon icon in light mode', () => {
    (useThemeMock as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme,
      resolvedTheme: 'light',
    })

    render(<ThemeToggle />)
    const moonIcon = screen.getByTestId('moon-icon')
    expect(moonIcon).toBeInTheDocument()
  })

  it('shows sun icon in dark mode', () => {
    (useThemeMock as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme,
      resolvedTheme: 'dark',
    })

    render(<ThemeToggle />)
    const sunIcon = screen.getByTestId('sun-icon')
    expect(sunIcon).toBeInTheDocument()
  })

  it('toggles theme when clicked (from dark to light)', () => {
    (useThemeMock as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme,
      resolvedTheme: 'dark',
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('toggles theme when clicked (from light to dark)', () => {
    (useThemeMock as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme,
      resolvedTheme: 'light',
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
}) 