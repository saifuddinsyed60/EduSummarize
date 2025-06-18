import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../page'

describe('Login Page', () => {
  it('renders the login form', () => {
    render(<LoginPage />)
    
    // Check for main elements
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the forgot password link', () => {
    render(<LoginPage />)
    const forgotPasswordLink = screen.getByText('Forgot password?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '#')
  })

  it('renders the sign up link', () => {
    render(<LoginPage />)
    const signUpLink = screen.getByText('Start a 14 day free trial')
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '#')
  })

  it('handles form submission', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Add assertions for form submission handling
    // This will depend on how you implement the form submission logic
  })

  it('validates required fields', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })
}) 