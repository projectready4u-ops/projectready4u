import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('[TEST EMAIL] API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('[TEST EMAIL] Sending test email...');

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ambinayak17@gmail.com',
      subject: 'Test Email from Projectready4U',
      html: '<h1>✅ Test Email</h1><p>If you see this, emails are working!</p>',
    });

    console.log('[TEST EMAIL] Response:', result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[TEST EMAIL] Error:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    return NextResponse.json(
      {
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}
