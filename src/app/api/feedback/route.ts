import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/utils';

// POST - Submit feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, rating, description } = body;

    // Validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Insert feedback (approved = false by default, admin will approve)
    const { data, error } = await supabase
      .from('customer_feedback')
      .insert([
        {
          email,
          name,
          rating,
          description,
          approved: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[FEEDBACK API] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: 'Failed to save feedback',
          details: error.message || 'Database error',
          hint: error.hint || 'The customer_feedback table may not exist. Please contact admin.',
        },
        { status: 500 }
      );
    }

    console.log('[FEEDBACK API] ✓ Feedback submitted:', data?.[0]?.id);

    return NextResponse.json(
      { success: true, feedback: data?.[0], message: 'Feedback submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[FEEDBACK API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET - Fetch feedback (supports filtering by approval status)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const approved = searchParams.get('approved');

    let query = supabase.from('customer_feedback').select('*').order('created_at', { ascending: false });

    if (approved === 'true') {
      query = query.eq('approved', true);
    } else if (approved === 'false') {
      query = query.eq('approved', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[FEEDBACK API] Database error on GET:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: 'Failed to load feedback',
          details: error.message || 'Database error',
          hint: 'The customer_feedback table may not exist. Please create it in Supabase.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedbacks: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('[FEEDBACK API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load feedback' },
      { status: 500 }
    );
  }
}
