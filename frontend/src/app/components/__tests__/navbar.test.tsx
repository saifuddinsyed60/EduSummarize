import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navbar', () => {
  beforeEach(() => {
    // Default pathname to home
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders the logo', () => {
    render(<Navbar />);
    expect(screen.getByText('EduSummarize')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('highlights active link', () => {
    (usePathname as jest.Mock).mockReturnValue('/upload');
    render(<Navbar />);
    const uploadLink = screen.getByText('Upload');
    expect(uploadLink).toHaveClass('relative', 'z-10');
  });

  it('opens mobile menu when clicking menu button', () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('closes mobile menu when clicking close button', () => {
    render(<Navbar />);
    // Open menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    // Close menu
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('closes mobile menu when clicking a navigation link', () => {
    render(<Navbar />);
    // Open menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    // Click the last 'Upload' link (mobile menu)
    const uploadLinks = screen.getAllByText('Upload');
    fireEvent.click(uploadLinks[uploadLinks.length - 1]);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('closes mobile menu when clicking logo', () => {
    render(<Navbar />);
    // Open menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    // Click logo
    const logo = screen.getByText('EduSummarize');
    fireEvent.click(logo);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });
}); 