// app/api/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  try {
    const response = await axios.get('http://localhost:8000/history', {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('History fetch error:', error);
    const message = error.response?.data?.detail || 'Failed to fetch history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
