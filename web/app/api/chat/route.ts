import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { POST as AnalystPOST } from '../agents/analyst/route';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Just call the analyst agent directly - it will handle routing internally
    const agentRequest = {
      json: async () => ({ message, sessionId }),
      headers: request.headers,
      cookies: request.cookies
    } as NextRequest;
    
    const response = await AnalystPOST(agentRequest);
    
    if (!response.ok) {
      throw new Error(`Analyst agent failed: ${response.statusText}`);
    }
    
    return response;

  } catch (error) {
    console.error('Chat orchestrator error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}