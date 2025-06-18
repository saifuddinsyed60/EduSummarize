import { POST } from '../route'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

jest.mock('axios')
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    json: () => Promise.resolve(JSON.parse(init.body)),
  })),
  NextResponse: {
    json: (data: any, init?: { status: number }) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    }),
  },
}))

describe('Process API Route', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('processes video successfully', async () => {
    const mockResponse = {
      data: {
        transcript: 'test transcript',
        summary: 'test summary',
      },
    }
    mockAxios.post.mockResolvedValueOnce(mockResponse)

    const req = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      body: JSON.stringify({ video_url: 'https://youtube.com/watch?v=123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:8000/process',
      { video_url: 'https://youtube.com/watch?v=123' },
      { headers: { 'Content-Type': 'application/json' } }
    )
    expect(data).toEqual(mockResponse.data)
  })

  it('handles API errors', async () => {
    const mockError = {
      response: {
        data: {
          detail: 'Invalid video URL',
        },
      },
    }
    mockAxios.post.mockRejectedValueOnce(mockError)

    const req = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      body: JSON.stringify({ video_url: 'invalid-url' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Invalid video URL' })
  })

  it('handles network errors', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Network error'))

    const req = new NextRequest('http://localhost:3000/api/process', {
      method: 'POST',
      body: JSON.stringify({ video_url: 'https://youtube.com/watch?v=123' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to process video' })
  })
}) 