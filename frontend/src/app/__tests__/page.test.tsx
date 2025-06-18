import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByText('Turn Your Videos Into Smart Notes')
    expect(heading).toBeInTheDocument()
  })

  it('renders the subheading text', () => {
    render(<Home />)
    const subheading = screen.getByText(/Transform your classroom experience/i)
    expect(subheading).toBeInTheDocument()
  })

  it('renders the get started button with correct link', () => {
    render(<Home />)
    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).toHaveAttribute('href', '/upload')
  })

  it('renders with correct background classes', () => {
    render(<Home />)
    const mainContainer = screen.getByRole('main')
    expect(mainContainer).toHaveClass('bg-white', 'dark:bg-gray-950')
  })

}) 