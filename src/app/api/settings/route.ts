import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, description } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value' },
        { status: 400 }
      );
    }

    console.log(`[Settings API] Saving ${key} = ${value}`);

    // Step 1: Try to get the existing record
    const { data: existingData, error: fetchError } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('setting_key', key)
      .single();

    console.log(`[Settings API] Existing data check:`, existingData ? 'Found' : 'Not found', fetchError ? `Error: ${fetchError.message}` : '');

    let result;
    let error;

    if (existingData?.id) {
      // Update existing record
      console.log(`[Settings API] Updating existing ${key}...`);
      const updateResult = await supabase
        .from('admin_settings')
        .update({
          setting_value: value,
          description: description || '',
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', key)
        .select();

      result = updateResult.data;
      error = updateResult.error;
      console.log(`[Settings API] Update result:`, error ? `Error: ${error.message}` : 'Success');
    } else {
      // Insert new record
      console.log(`[Settings API] Inserting new ${key}...`);
      const insertResult = await supabase
        .from('admin_settings')
        .insert({
          setting_key: key,
          setting_value: value,
          description: description || '',
        })
        .select();

      result = insertResult.data;
      error = insertResult.error;
      console.log(`[Settings API] Insert result:`, error ? `Error: ${error.message}` : 'Success');
    }

    if (error) {
      console.error(`[Settings API] Operation error for ${key}:`, error);
      return NextResponse.json(
        { error: error.message, details: error, key },
        { status: 500 }
      );
    }

    console.log(`[Settings API] ✓ Successfully saved ${key}:`, result);
    return NextResponse.json({ success: true, data: result, key });
  } catch (error: any) {
    console.error('[Settings API] Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update settings', details: error },
      { status: 500 }
    );
  }
}
