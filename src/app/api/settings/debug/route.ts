import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Debug endpoint to check what's currently in the admin_settings table
 */
export async function GET(req: NextRequest) {
  try {
    console.log('[DEBUG] Fetching all admin_settings from database...');

    const { data, error } = await supabase
      .from('admin_settings')
      .select('*');

    if (error) {
      console.error('[DEBUG] Error fetching settings:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log('[DEBUG] Settings in database:', data);
    return NextResponse.json({ success: true, data, count: data?.length || 0 });
  } catch (error: any) {
    console.error('[DEBUG] Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch debug info', details: error },
      { status: 500 }
    );
  }
}
