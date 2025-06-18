/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DashboardPage from '../page'
import { useSearchParams } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('DashboardPage', () => {
  const mockTranscript = '[00:00] Test line 1\n[00:30] Test line 2\n[01:00] Test line 3\n[01:30] Test line 4\n[02:00] Test line 5\n[02:30] Test line 6\n[03:00] Test line 7\n[03:30] Test line 8\n[04:00] Test line 9\n[04:30] Test line 10'
  const mockSummary = '- **[00:00]** Test point 1\n- **[00:30]** Test point 2\n- **[01:00]** Test point 3\n- **[01:30]** Test point 4\n- **[02:00]** Test point 5\n- **[02:30]** Test point 6\n- **[03:00]** Test point 7\n- **[03:30]** Test point 8\n- **[04:00]** Test point 9\n- **[04:30]** Test point 10'
  const mockVideoUrl = 'https://youtube.com/watch?v=123456'

  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => {
        switch (param) {
          case 'videoUrl':
            return mockVideoUrl
          case 'transcript':
            return mockTranscript
          case 'summary':
            return mockSummary
          default:
            return null
        }
      }
    })
  })

  it('renders video player when URL is provided', () => {
    render(<DashboardPage />)
    const iframe = screen.getByTitle('YouTube video player')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('123456'))
  })

  it('renders transcript sections', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Transcript')).toBeInTheDocument()
    const transcriptLines = screen.getAllByText(/Test line \d+/)
    expect(transcriptLines.length).toBeGreaterThan(0)
  })

  it('renders summary sections', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Lecture Summary')).toBeInTheDocument()
    const summaryPoints = screen.getAllByText(/Test point \d+/)
    expect(summaryPoints.length).toBeGreaterThan(0)
  })

  it('handles transcript search', () => {
    render(<DashboardPage />)
    const searchInput = screen.getAllByPlaceholderText('Search')[0]
    fireEvent.change(searchInput, { target: { value: 'Test line 1' } })
    const highlightedText = screen.getAllByText('Test line 1')
    expect(highlightedText.length).toBeGreaterThan(0)
  })

  it('handles summary search', () => {
    render(<DashboardPage />)
    const searchInput = screen.getAllByPlaceholderText('Search')[1]
    fireEvent.change(searchInput, { target: { value: 'Test point 1' } })
    const highlightedText = screen.getAllByText('Test point 1')
    expect(highlightedText.length).toBeGreaterThan(0)
  })

  it('handles copy functionality', async () => {
    render(<DashboardPage />)
    const copyButton = screen.getAllByText('Copy')[0]
    fireEvent.click(copyButton)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTranscript)
  })

  it('handles show more/less for transcript', async () => {
    render(<DashboardPage />)
    const showMoreButton = screen.getByText('Show more')
    fireEvent.click(showMoreButton)
    await waitFor(() => {
      expect(screen.getByText('Show less')).toBeInTheDocument()
    })
  })

  it('handles show more/less for summary', async () => {
    render(<DashboardPage />)
    const showMoreButton = screen.getByText('Show more')
    fireEvent.click(showMoreButton)
    await waitFor(() => {
      expect(screen.getByText('Show less')).toBeInTheDocument()
    })
  })

  it('extracts YouTube ID correctly', () => {
    render(<DashboardPage />)
    const iframe = screen.getByTitle('YouTube video player')
    expect(iframe).toHaveAttribute('src', expect.stringContaining('123456'))
  })

  it('renders correctly with empty transcript and summary', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => ''
    });
    render(<DashboardPage />);
    expect(screen.getByText('Transcript')).toBeInTheDocument();
    expect(screen.getByText('Lecture Summary')).toBeInTheDocument();
  });

  it('does not show "Show more" button for short transcript/summary', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (param: string) => {
        if (param === 'videoUrl') return mockVideoUrl;
        if (param === 'transcript') return '[00:00] Short';
        if (param === 'summary') return '- **[00:00]** Short';
        return null;
      }
    });
    render(<DashboardPage />);
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('handles download functionality', () => {
    // Mock URL methods
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    
    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    // Mock document.createElement
    const originalCreateElement = document.createElement;
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };
    
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'a') return mockAnchor as any;
      return originalCreateElement.call(document, tagName);
    });

    render(<DashboardPage />);
    
    // Click the first Download button (transcript)
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url');

    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('handles highlight text functionality', () => {
    render(<DashboardPage />);
    
    // Test transcript search highlighting
    const transcriptSearchInput = screen.getAllByPlaceholderText('Search')[0];
    fireEvent.change(transcriptSearchInput, { target: { value: 'Test line' } });
    
    // Test summary search highlighting
    const summarySearchInput = screen.getAllByPlaceholderText('Search')[1];
    fireEvent.change(summarySearchInput, { target: { value: 'Test point' } });
    
    // Verify that the search terms are highlighted
    const highlightedTranscript = screen.getAllByText(/Test line/);
    const highlightedSummary = screen.getAllByText(/Test point/);
    
    expect(highlightedTranscript.length).toBeGreaterThan(0);
    expect(highlightedSummary.length).toBeGreaterThan(0);
  });

  it('handles YouTube ID extraction for different URL formats', () => {
    const testCases = [
      { url: 'https://youtube.com/watch?v=123456', expected: '123456' },
      { url: 'https://youtu.be/123456', expected: '123456' },
      { url: 'https://youtube.com/watch?v=123456&t=30s', expected: '123456' },
      { url: 'invalid-url', expected: '' }
    ];

    testCases.forEach(({ url, expected }) => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (param: string) => param === 'videoUrl' ? url : null
      });
      
      const { unmount } = render(<DashboardPage />);
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining(expected));
      unmount();
    });
  });
}) 