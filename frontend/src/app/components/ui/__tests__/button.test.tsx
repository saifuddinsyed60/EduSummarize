import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Button className="bg-blue-500">Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toHaveClass('bg-blue-500')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies default styles', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toHaveClass('px-4', 'py-2', 'rounded-md', 'font-medium', 'transition-colors')
  })

  it('forwards additional props', () => {
    render(<Button data-testid="test-button" disabled>Click me</Button>)
    const button = screen.getByTestId('test-button')
    expect(button).toBeDisabled()
  })
}) 