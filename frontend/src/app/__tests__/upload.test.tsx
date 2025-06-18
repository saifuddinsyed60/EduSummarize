import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadPage from '../upload/page'
import { useRouter } from 'next/navigation'
import { processVideo } from '@/lib/api'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the processVideo API
jest.mock('@/lib/api', () => ({
  processVideo: jest.fn()
}))

describe('UploadPage', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders the upload form', () => {
    render(<UploadPage />)
    expect(screen.getByText('Video Transcription & Summary')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Transcribe & Summarize' })).toBeInTheDocument()
  })

  it('handles successful video processing', async () => {
    const mockResponse = {
      transcript: '[00:00] Test transcript line 1\n[00:10] Test transcript line 2',
      summary: '- **[00:00]** Test summary line 1\n- **[00:10]** Test summary line 2'
    }
    ;(processVideo as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<UploadPage />)
    
    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const button = screen.getByRole('button', { name: 'Transcribe & Summarize' })

    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(processVideo).toHaveBeenCalledWith('https://www.youtube.com/watch?v=123')
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/dashboard?videoUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D123&transcript=%5B00%3A00%5D%20Test%20transcript%20line%201%0A%5B00%3A10%5D%20Test%20transcript%20line%202&summary=-%20**%5B00%3A00%5D**%20Test%20summary%20line%201%0A-%20**%5B00%3A10%5D**%20Test%20summary%20line%202'
      )
    })
  })

  it('handles API error', async () => {
    ;(processVideo as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<UploadPage />)
    
    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const button = screen.getByRole('button', { name: 'Transcribe & Summarize' })

    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to process video.')).toBeInTheDocument()
    })
  })

  it('validates YouTube URL', async () => {
    render(<UploadPage />)
    
    const input = screen.getByPlaceholderText('https://www.youtube.com/watch?v=...')
    const button = screen.getByRole('button', { name: 'Transcribe & Summarize' })

    fireEvent.change(input, { target: { value: 'invalid-url' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to process video.')).toBeInTheDocument()
    })
  })
}) 