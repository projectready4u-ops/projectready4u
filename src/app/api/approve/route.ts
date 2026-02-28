import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/gmail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, projectTitle, email, fullName, college, repoLink } = body;

    if (!repoLink) {
      return NextResponse.json(
        { error: 'Repository link is required' },
        { status: 400 }
      );
    }

    // Get project price and other details
    const { data: requestData, error: fetchError } = await supabase
      .from('project_requests')
      .select(`
        id,
        project_id,
        user_email,
        user_name,
        college_name,
        projects:project_id(title, price)
      `)
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    const projectInfo = requestData.projects as any;

    // Update request status with repo link
    const { error: updateError } = await supabase
      .from('project_requests')
      .update({
        status: 'approved',
        download_link: repoLink,
        download_link_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Send approval email with repo link
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;
    
    console.log('[APPROVE API] Sending approval email with:', {
      email,
      projectTitle,
      repoLink,
      whatsappNumber,
    });

    try {
      const defaultIncludes = [
        'Complete source code',
        'Project report',
        'PowerPoint presentation',
        'README documentation',
        'Setup instructions',
      ];

      const emailResult = await sendApprovalEmail(
        email,
        projectTitle,
        repoLink,
        defaultIncludes,
        whatsappNumber,
        requestId  // Pass requestId for download link generation
      );
      
      console.log('[APPROVE API] Email sent successfully:', emailResult.messageId);
    } catch (emailError: any) {
      console.error('[APPROVE API] Email sending failed:', {
        error: emailError.message,
        code: emailError.code,
        to: email,
      });
      // Don't fail the request if email fails - repo access is more important
    }

    return NextResponse.json({ 
      success: true,
      message: 'Request approved and email sent with repository access link'
    });
  } catch (error: any) {
    console.error('[APPROVE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve request' },
      { status: 500 }
    );
  }
}

