import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

export async function GET(req: NextRequest) {
  try {
    console.log('[DIAGNOSTICS] Starting email diagnostics...');

    // 1. Check API Key
    const apiKey = process.env.RESEND_API_KEY;
    console.log('[DIAGNOSTICS] Resend API Key exists:', !!apiKey);
    console.log('[DIAGNOSTICS] API Key starts with:', apiKey?.substring(0, 10) + '...');

    // 2. Fetch admin email from settings
    console.log('[DIAGNOSTICS] Fetching admin email from Supabase...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value');

    if (settingsError) {
      console.error('[DIAGNOSTICS] Settings error:', settingsError);
    }

    let adminEmail = 'admin@projectready4u.com';
    settingsData?.forEach((setting: any) => {
      if (setting.setting_key === 'contact_email') {
        adminEmail = setting.setting_value;
        console.log('[DIAGNOSTICS] Found admin email in settings:', adminEmail);
      }
    });

    console.log('[DIAGNOSTICS] Admin email to use:', adminEmail);

    // 3. Try sending a test email
    console.log('[DIAGNOSTICS] Attempting to send test email...');
    const resend = new Resend(apiKey);

    const testEmailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: '🧪 Test Email - Projectready4U',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>✅ Test Email Successful</h1>
          <p>If you're seeing this, the email system is working!</p>
          <p><strong>Sent to:</strong> ${adminEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr />
          <h2>Next Steps:</h2>
          <ol>
            <li>Try submitting a project request</li>
            <li>You should receive both admin and requester emails</li>
            <li>Check spam folder if not in inbox</li>
          </ol>
        </div>
      `,
    });

    console.log('[DIAGNOSTICS] Test email result:', testEmailResult);

    return NextResponse.json({
      success: true,
      diagnostics: {
        apiKeyConfigured: !!apiKey,
        adminEmail: adminEmail,
        settingsCount: settingsData?.length || 0,
        allSettings: settingsData || [],
        testEmailSent: testEmailResult,
      },
      message: `✅ Test email sent to ${adminEmail}. Check your inbox!`,
    });
  } catch (error: any) {
    console.error('[DIAGNOSTICS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          code: error.code,
          status: error.status,
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
