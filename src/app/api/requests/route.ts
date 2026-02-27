import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAdminNotificationEmail, sendRequestConfirmationEmail } from '@/lib/gmail';
import { isValidEmail, isValidPhone } from '@/lib/utils';

// Helper function to send WhatsApp notification to admin
async function sendWhatsAppNotificationToAdmin(
  adminWhatsApp: string,
  projectId: string,
  projectTitle: string,
  fullName: string,
  email: string,
  phone: string,
  college: string,
  requestId: string
) {
  try {
    // Format message in tabular format for WhatsApp
    const message = `🔔 *NEW REQUEST NOTIFICATION*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n*REQUEST DETAILS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📋 *Request ID:* ${requestId}\n🆔 *Project ID:* ${projectId}\n📚 *Project:* ${projectTitle}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n*REQUESTER INFO*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 *Name:* ${fullName}\n📧 *Email:* ${email}\n📱 *Phone:* ${phone}\n🎓 *College:* ${college}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ *Action Required:* Review & Approve\n🔗 *Admin Panel:* ${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${adminWhatsApp}/?text=${encodedMessage}`;
    
    console.log('[WHATSAPP] Admin notification ready at:', whatsappLink);
    
    // In a production app, you'd use Twilio or WhatsApp Cloud API to send automatically
    // For now, we log it so admin can check console or use the link
    return { success: true, link: whatsappLink };
  } catch (error) {
    console.error('[WHATSAPP] Error preparing notification:', error);
    return { success: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      projectTitle,
      fullName,
      email,
      phone,
      college,
      branch,
      semester,
      message,
    } = body;

    console.log('[REQUEST API] Received request:', { projectTitle, email, fullName });

    // Validation
    if (!fullName || !isValidEmail(email) || !isValidPhone(phone) || !college) {
      console.warn('[REQUEST API] Validation failed:', { fullName, email, phone, college });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 requests per email per 24 hours)
    const { data: recentRequests } = await supabase
      .from('project_requests')
      .select('id')
      .eq('user_email', email)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(3);

    if (recentRequests && recentRequests.length >= 3) {
      console.warn('[REQUEST API] Rate limit exceeded for:', email);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Fetch project price
    const { data: projectData } = await supabase
      .from('projects')
      .select('price, discounted_price')
      .eq('id', projectId)
      .single();

    const projectPrice = projectData?.discounted_price || projectData?.price || 0;

    // Insert request with correct column names
    const { data, error } = await supabase
      .from('project_requests')
      .insert([
        {
          project_id: projectId,
          user_name: fullName,
          user_email: email,
          user_phone: phone,
          college_name: college,
          branch: branch || null,
          semester: semester || null,
          message: message || null,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      console.error('[REQUEST API] Supabase insert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log('[REQUEST API] ✓ Request inserted:', data?.[0]?.id);
    const requestId = data?.[0]?.id;

    // Fetch admin email and WhatsApp from settings
    console.log('[REQUEST API] Fetching admin settings...');
    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value');

    let adminEmail = 'admin@projectready4u.com';
    let whatsappNumber = '919876543210';

    settingsData?.forEach((setting: any) => {
      if (setting.setting_key === 'contact_email') {
        adminEmail = setting.setting_value;
      } else if (setting.setting_key === 'whatsapp_number') {
        whatsappNumber = setting.setting_value;
      }
    });

    console.log('[REQUEST API] Admin email:', adminEmail, 'WhatsApp:', whatsappNumber);

    // Send confirmation email to requester
    console.log('[REQUEST API] Sending confirmation email to requester:', email);
    try {
      const emailResult = await sendRequestConfirmationEmail(
        email,
        projectTitle,
        projectPrice,
        fullName,
        college,
        requestId,
        whatsappNumber
      );
      console.log('[REQUEST API] ✓ Confirmation email sent:', emailResult);
    } catch (emailError: any) {
      console.error('[REQUEST API] Confirmation email failed:', {
        message: emailError.message,
        error: emailError,
      });
    }

    // Send admin notification email
    console.log('[REQUEST API] Sending admin email to:', adminEmail);
    try {
      const adminEmailResult = await sendAdminNotificationEmail(
        adminEmail,
        projectTitle,
        fullName,
        email,
        phone,
        '', // whatsappNumber (not collected anymore)
        college,
        '', // city (not collected anymore)
        '', // state (not collected anymore)
        '', // trafficSource (not collected anymore)
        message || '',
        new Date().toISOString()
      );
      console.log('[REQUEST API] ✓ Admin email sent:', adminEmailResult);
    } catch (emailError: any) {
      console.error('[REQUEST API] Admin email failed:', {
        message: emailError.message,
        error: emailError,
      });
    }

    // Send WhatsApp notification to admin
    console.log('[REQUEST API] Preparing WhatsApp notification...');
    try {
      const whatsappResult = await sendWhatsAppNotificationToAdmin(
        whatsappNumber,
        projectId,
        projectTitle,
        fullName,
        email,
        phone,
        college,
        requestId
      );
      console.log('[REQUEST API] ✓ WhatsApp notification prepared:', whatsappResult);
    } catch (whatsappError) {
      console.error('[REQUEST API] WhatsApp notification failed:', whatsappError);
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Request submitted successfully! You will be contacted on WhatsApp with your request details.',
    });
  } catch (error: any) {
    console.error('[REQUEST API] Request creation error:', error);
    const errorMessage = error?.message || 'Failed to process request';
    const errorDetails = error?.details || error?.hint || 'No additional details';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
