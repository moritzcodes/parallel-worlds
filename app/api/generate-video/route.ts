import { NextRequest, NextResponse } from 'next/server';

// Luma Dream Machine API endpoint
const LUMA_API_BASE = 'https://api.lumalabs.ai/dream-machine/v1';

interface GenerateVideoRequest {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | '9:21';
  loop?: boolean;
  keyframes?: {
    frame0?: {
      type: 'image' | 'generation';
      url?: string;
      id?: string;
    };
    frame1?: {
      type: 'image' | 'generation';
      url?: string;
      id?: string;
    };
  };
}

interface LumaGenerationResponse {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  failure_reason?: string;
  created_at: string;
  assets?: {
    video?: string;
  };
  version?: string;
  request?: {
    prompt: string;
    aspect_ratio: string;
    loop: boolean;
  };
}

// Generate a new video
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LUMA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Luma API key not configured' },
        { status: 500 }
      );
    }

    const body: GenerateVideoRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${LUMA_API_BASE}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: body.prompt,
        aspect_ratio: body.aspect_ratio || '16:9',
        loop: body.loop ?? false,
        keyframes: body.keyframes,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Luma API error: ${error}` },
        { status: response.status }
      );
    }

    const data: LumaGenerationResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

// Check generation status
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.LUMA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Luma API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('id');

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Luma API error: ${error}` },
        { status: response.status }
      );
    }

    const data: LumaGenerationResponse = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking generation status:', error);
    return NextResponse.json(
      { error: 'Failed to check generation status' },
      { status: 500 }
    );
  }
}



