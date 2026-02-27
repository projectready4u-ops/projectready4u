import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: approved } = await supabase
      .from('project_requests')
      .select(`
        id,
        user_email,
        status,
        download_link,
        created_at
      `)
      .eq('status', 'approved');

    const { data: pending } = await supabase
      .from('project_requests')
      .select(`
        id,
        user_email,
        status,
        created_at
      `)
      .eq('status', 'pending');

    return NextResponse.json({
      approved_count: approved?.length || 0,
      pending_count: pending?.length || 0,
      approved_requests: approved || [],
      pending_requests: pending || [],
      instructions: 'Use approved request IDs for download testing: /api/download?requestId=ID'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
