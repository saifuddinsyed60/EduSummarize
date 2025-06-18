// app/api/history/detail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const videoUrl = req.nextUrl.searchParams.get('video_url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing video_url parameter' }, { status: 400 });
  }

  try {
    const response = await axios.get(`http://localhost:8000/history/detail`, {
      params: { video_url: videoUrl },
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Detail fetch error:', error);
    const message = error.response?.data?.detail || 'Failed to fetch video detail';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
