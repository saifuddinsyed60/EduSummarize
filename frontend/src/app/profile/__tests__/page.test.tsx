import { render, screen } from '@testing-library/react'
import ProfilePage from '../page'

describe('Profile Page', () => {
  it('renders the sidebar navigation', () => {
    render(<ProfilePage />)
    
    expect(screen.getByText('My Notes')).toBeInTheDocument()
    expect(screen.getByText('Upload New Video')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders the main content header', () => {
    render(<ProfilePage />)
    
    expect(screen.getByText('My Saved Lectures')).toBeInTheDocument()
    expect(screen.getByText('Browse through your saved lecture notes')).toBeInTheDocument()
  })

  it('renders lecture cards with correct information', () => {
    render(<ProfilePage />)
    
    // Check first lecture
    expect(screen.getByText('Introduction to Psychology')).toBeInTheDocument()
    expect(screen.getByText('Prof. Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('October 15, 2023')).toBeInTheDocument()
    
    // Check second lecture
    expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Prof. Michael Chen')).toBeInTheDocument()
    expect(screen.getByText('October 12, 2023')).toBeInTheDocument()
  })

  it('renders view notes buttons for each lecture', () => {
    render(<ProfilePage />)
    const viewNotesButtons = screen.getAllByText('View Notes')
    
    expect(viewNotesButtons).toHaveLength(2)
    viewNotesButtons.forEach(button => {
      expect(button).toHaveClass('bg-blue-600')
    })
  })

  it('renders navigation links with correct hrefs', () => {
    render(<ProfilePage />)
    
    const uploadLink = screen.getByText('Upload New Video')
    expect(uploadLink).toHaveAttribute('href', '/upload')
    
    const myNotesLink = screen.getByText('My Notes')
    expect(myNotesLink).toHaveAttribute('href', '#')
    
    const settingsLink = screen.getByText('Settings')
    expect(settingsLink).toHaveAttribute('href', '#')
  })

  it('applies correct styling classes', () => {
    render(<ProfilePage />)
    
    // Check sidebar styling
    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveClass('bg-white', 'dark:bg-gray-900')
    
    // Check main content styling
    const mainContent = screen.getByRole('main')
    expect(mainContent).toHaveClass('bg-gray-50', 'dark:bg-gray-800')
    
    // Check lecture card styling
    const lectureCards = screen.getAllByRole('article')
    lectureCards.forEach(card => {
      expect(card).toHaveClass('bg-white', 'dark:bg-gray-700')
    })
  })
}) 