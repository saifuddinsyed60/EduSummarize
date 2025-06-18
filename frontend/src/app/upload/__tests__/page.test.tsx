import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadPage from '../page'
import { useRouter } from 'next/navigation'
import { processVideo } from '@/lib/api'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the API
jest.mock('@/lib/api', () => ({
  processVideo: jest.fn(),
}))

describe('Upload Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders upload form', () => {
    render(<UploadPage />)
    expect(screen.getByText('Video Transcription & Summary')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
    expect(screen.getByText('Transcribe & Summarize')).toBeInTheDocument()
  })

  it('handles successful video processing', async () => {
    const mockData = {
      transcript: 'Test transcript',
      summary: 'Test summary',
    }
    ;(processVideo as jest.Mock).mockResolvedValueOnce(mockData)

    render(<UploadPage />)
    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const button = screen.getByText('Transcribe & Summarize')

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(processVideo).toHaveBeenCalledWith('https://youtube.com/watch?v=123')
      expect(mockPush).toHaveBeenCalledWith(
        `/dashboard?videoUrl=${encodeURIComponent('https://youtube.com/watch?v=123')}&transcript=${encodeURIComponent('Test transcript')}&summary=${encodeURIComponent('Test summary')}`
      )
    })
  })

  it('handles API error', async () => {
    ;(processVideo as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<UploadPage />)
    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const button = screen.getByText('Transcribe & Summarize')

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to process video.')).toBeInTheDocument()
    })
  })

  it('does not process empty URL', async () => {
    render(<UploadPage />)
    const button = screen.getByText('Transcribe & Summarize')

    fireEvent.click(button)

    await waitFor(() => {
      expect(processVideo).not.toHaveBeenCalled()
    })
  })
}) 