// app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Get the token from the Authorization header (sent by the frontend)
  const authHeader = req.headers.get('authorization');

  try {
    const response = await axios.post('http://localhost:8000/process', body, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }), // Pass token to FastAPI
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(error);
    const message = error.response?.data?.detail || 'Failed to process video';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
