import axios from 'axios'
import { processVideo } from '../api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processVideo', () => {
    it('handles API errors', async () => {
      const mockError = new Error('API Error')
      mockedAxios.post.mockRejectedValueOnce(mockError)

      await expect(processVideo('invalid-url')).rejects.toThrow('API Error')
    })

    it('validates video URL input', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Invalid video URL'
          }
        }
      }
      mockedAxios.post.mockRejectedValueOnce(mockError)

      await expect(processVideo('invalid-url')).rejects.toThrow('Invalid video URL')
    })

    it('processes valid video URL', async () => {
      const mockResponse = {
        data: {
          transcript: 'Test transcript',
          summary: 'Test summary'
        }
      }
      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await processVideo('https://www.youtube.com/watch?v=valid')
      expect(result).toEqual(mockResponse.data)
    })

    it('throws an error with detail from response', async () => {
      const errorResponse = { response: { data: { detail: 'Invalid video URL' } } };
      (axios.post as jest.Mock).mockRejectedValueOnce(errorResponse);
      await expect(processVideo('invalid-url')).rejects.toThrow('Invalid video URL');
    })

    it('throws an error if videoUrl is empty', async () => {
      await expect(processVideo('')).rejects.toThrow('Video URL is required');
    });
  })
}) 