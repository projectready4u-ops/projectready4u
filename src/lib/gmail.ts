import nodemailer from 'nodemailer';
import { supabase } from './supabase';

// Validate Gmail credentials on startup
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_PASSWORD;

if (!gmailUser || !gmailPassword) {
  console.error('[GMAIL] ❌ CRITICAL: Gmail credentials not configured!');
  console.error('[GMAIL] Set GMAIL_USER and GMAIL_PASSWORD env variables');
}

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
});

// Verify Gmail connection on startup
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('[GMAIL] ❌ SMTP Connection Failed:', error);
  } else if (success) {
    console.log('[GMAIL] ✓ SMTP Connection Successful');
  }
});

// Helper function to fetch template from database
export const getEmailTemplate = async (templateKey: string) => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .single();

    if (error) {
      console.warn(`[GMAIL] Template ${templateKey} not found in database:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[GMAIL] Error fetching template:', error);
    return null;
  }
};

// Helper function to replace template variables
export const renderTemplate = (htmlContent: string, subject: string, variables: Record<string, any>) => {
  let rendered = htmlContent;
  let subjectRendered = subject;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const safeValue = value ? String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    rendered = rendered.split(placeholder).join(safeValue);
    subjectRendered = subjectRendered.split(placeholder).join(safeValue);
  });

  return { renderedHtml: rendered, renderedSubject: subjectRendered };
};

export const sendAdminNotificationEmail = async (
  adminEmail: string,
  projectTitle: string,
  fullName: string,
  email: string,
  phone: string,
  whatsappNumber: string,
  college: string,
  city: string,
  state: string,
  trafficSource: string,
  message: string,
  requestedAt: string
) => {
  const whatsappLink = `https://wa.me/91${whatsappNumber}`;

  try {
    // Try to fetch template from database
    const template = await getEmailTemplate('admin_notification');
    
    let htmlContent = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">New Project Request</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="margin-bottom: 15px;">
            <strong>Project:</strong> ${projectTitle}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Name:</strong> ${fullName}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Email:</strong> ${email}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Phone:</strong> ${phone}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>College:</strong> ${college}
          </div>
          ${message ? `<div style="margin-bottom: 15px;"><strong>Message:</strong> ${message}</div>` : ''}
          <div style="margin-bottom: 15px;">
            <strong>Requested at:</strong> ${new Date(requestedAt).toLocaleString()}
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <a href="${whatsappLink}" style="display: inline-block; background: #25d366; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            📱 Open WhatsApp
          </a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            📋 View in Admin
          </a>
        </div>
      </div>
    `;
    
    let subject = `🔔 New Request — ${projectTitle}`;

    // Use database template if available
    if (template) {
      const variables = {
        project_title: projectTitle,
        fullName,
        email,
        phone,
        college,
        requestedAt: new Date(requestedAt).toLocaleString(),
        whatsapp_link: whatsappLink,
        admin_link: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests`,
        message_section: message ? `<div style="margin-bottom: 15px;"><strong>Message:</strong> ${message}</div>` : '',
      };
      
      const { renderedHtml, renderedSubject } = renderTemplate(template.html_content, template.subject, variables);
      htmlContent = renderedHtml;
      subject = renderedSubject;
    }

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject,
      html: htmlContent,
    });

    console.log('[GMAIL] ✓ Admin email sent:', result.messageId, 'to:', adminEmail);
    return result;
  } catch (error: any) {
    console.error('[GMAIL] ❌ Admin email error:', {
      to: adminEmail,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};

export const sendRequestConfirmationEmail = async (
  userEmail: string,
  projectTitle: string,
  projectPrice: number,
  fullName: string,
  college: string,
  requestId: string,
  whatsappNumber: string
) => {
  try {
    // Try to fetch template from database
    const template = await getEmailTemplate('requester_confirmation');
    
    let htmlContent = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Request Received ✅</h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Hi <strong>${fullName}</strong>,<br/><br/>
          Thank you for your interest in our project! We have received your request and our team will review it shortly.
        </p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Request Details</h3>
          
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Project Name:</span><br/>
            <strong style="color: #1f2937; font-size: 15px;">${projectTitle}</strong>
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Your Name:</span><br/>
            <strong style="color: #1f2937; font-size: 15px;">${fullName}</strong>
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">College:</span><br/>
            <strong style="color: #1f2937; font-size: 15px;">${college}</strong>
          </div>

          <div style="margin-bottom: 12px;">
            <span style="color: #6b7280;">Price:</span><br/>
            <strong style="color: #7c3aed; font-size: 18px;">₹${projectPrice.toLocaleString('en-IN')}</strong>
          </div>

          <div>
            <span style="color: #6b7280;">Request ID:</span><br/>
            <strong style="color: #1f2937; font-size: 13px;">${requestId}</strong>
          </div>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #92400e;">What happens next?</strong>
          <p style="margin: 10px 0 0 0; color: #374151; line-height: 1.6;">
            1. Our admin team will review your request<br/>
            2. We'll contact you via WhatsApp or email within 24 hours<br/>
            3. Upon approval, you'll receive your download link<br/>
            4. You can access your project directly
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
          📞 <strong>Any questions?</strong> Feel free to reach out on <a href="https://wa.me/91${whatsappNumber}" style="color: #7c3aed; text-decoration: none;">WhatsApp</a> or reply to this email.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This is an automated confirmation email. Please don't reply with sensitive information.
        </p>
      </div>
    `;
    
    let subject = `✅ Your Request Received — ${projectTitle}`;

    // Use database template if available
    if (template) {
      const variables = {
        project_title: projectTitle,
        fullName,
        college,
        projectPrice: `₹${projectPrice.toLocaleString('en-IN')}`,
        requestId,
        whatsapp: whatsappNumber,
      };
      
      const { renderedHtml, renderedSubject } = renderTemplate(template.html_content, template.subject, variables);
      htmlContent = renderedHtml;
      subject = renderedSubject;
    }

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log('[GMAIL] ✓ Confirmation email sent to:', userEmail, '- ID:', result.messageId);
    return result;
  } catch (error: any) {
    console.error('[GMAIL] ❌ Confirmation email error:', {
      to: userEmail,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};

export const sendApprovalEmail = async (
  userEmail: string,
  projectTitle: string,
  repoLink: string,
  includes: string[],
  whatsappNumber: string,
  requestId?: string
) => {
  const includesList = includes.join(', ');
  const isGitHubLink = repoLink.includes('github.com');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://projectready4u-virid.vercel.app';
  const downloadUrl = requestId ? `${siteUrl}/api/download?requestId=${requestId}` : repoLink;
  
  console.log('[GMAIL] Download URL:', { siteUrl, requestId, downloadUrl });

  try {
    // Try to fetch template from database
    const template = await getEmailTemplate('project_approved');
    
    let htmlContent = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Your Project is Ready! 🎉</h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Congratulations! Your request for <strong>${projectTitle}</strong> has been approved. Your project files are ready for download below.
        </p>

        <div style="margin: 30px 0;">
          <a href="${downloadUrl}" style="display: block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; font-size: 16px;">
            📥 Download Project ZIP
          </a>
        </div>

        <div style="background: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>📦 What you're downloading:</strong><br/>
            Complete project source code with all files ready to use. Extract the ZIP and follow the README to get started.
          </p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #16a34a;">✅ Your download includes:</strong>
          <p style="margin: 10px 0 0 0; color: #374151;">${includesList}</p>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #92400e;">How to get started:</strong>
          <p style="margin: 10px 0 0 0; color: #374151; line-height: 1.6;">
            1. Click the "Download Project ZIP" button above<br/>
            2. Extract the ZIP file to your desired folder<br/>
            3. Open the folder and follow the README.md file for setup instructions<br/>
            4. Reach out on WhatsApp if you need any help
          </p>
        </div>

        <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 13px;">
            <strong>ℹ️ Download Link Valid For:</strong> 30 days from approval<br/>
            <strong>⚠️ Tip:</strong> Save the project to your device immediately. If you have any issues downloading, contact us via WhatsApp!
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin: 20px 0;">
          📞 <strong>Need help?</strong> Chat with us on <a href="https://wa.me/91${whatsappNumber}" style="color: #7c3aed; text-decoration: none;">WhatsApp</a> or reply to this email.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          💾 Save this email for future reference. Your download link will remain active for 30 days.
        </p>
      </div>
    `;
    
    let subject = `✅ Your Project is Ready — ${projectTitle}`;

    // Use database template if available
    if (template) {
      const variables = {
        project_title: projectTitle,
        download_link: downloadUrl,
        includes_list: includesList,
        whatsapp: whatsappNumber,
      };
      
      const { renderedHtml, renderedSubject } = renderTemplate(template.html_content, template.subject, variables);
      htmlContent = renderedHtml;
      subject = renderedSubject;
    }

    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log('[GMAIL] ✓ Approval email sent to:', userEmail, '- ID:', result.messageId);
    return result;
  } catch (error: any) {
    console.error('[GMAIL] ❌ Approval email error:', {
      to: userEmail,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};
