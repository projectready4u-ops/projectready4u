import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: adminEmail,
    subject: `🔔 New Request — ${projectTitle}`,
    html: `
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
            <strong>WhatsApp:</strong> ${whatsappNumber}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>College:</strong> ${college}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>City, State:</strong> ${city}, ${state}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Found via:</strong> ${trafficSource}
          </div>
          ${message ? `<div style="margin-bottom: 15px;"><strong>Message:</strong> ${message}</div>` : ''}
          <div style="margin-bottom: 15px;">
            <strong>Requested at:</strong> ${new Date(requestedAt).toLocaleString()}
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <a href="${whatsappLink}" style="display: inline-block; background: #25d366; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Open WhatsApp
          </a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/requests" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            View in Admin
          </a>
        </div>
      </div>
    `,
  });
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
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: userEmail,
    subject: `✅ Your Request Received — ${projectTitle}`,
    html: `
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
    `,
  });
};

export const sendApprovalEmail = async (
  userEmail: string,
  projectTitle: string,
  downloadLink: string,
  includes: string[],
  whatsappNumber: string
) => {
  const includesList = includes.join(', ');

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: userEmail,
    subject: `✅ Your Project is Ready — ${projectTitle}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Your Project is Ready! 🎉</h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Congratulations! Your request for <strong>${projectTitle}</strong> has been approved. Your download link is ready below.
        </p>

        <div style="margin: 30px 0;">
          <a href="${downloadLink}" style="display: block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; font-size: 16px;">
            📥 Download Your Project
          </a>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #16a34a;">✅ Your download includes:</strong>
          <p style="margin: 10px 0 0 0; color: #374151;">${includesList}</p>
        </div>

        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #92400e;">How to get started:</strong>
          <p style="margin: 10px 0 0 0; color: #374151;">
            1. Download the ZIP file using the button above<br/>
            2. Extract the contents to your desired location<br/>
            3. Follow the README.md file inside for setup instructions<br/>
            4. Reach out on WhatsApp if you need any help
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          📞 <strong>Need help?</strong> Chat with us on <a href="https://wa.me/91${whatsappNumber}" style="color: #7c3aed; text-decoration: none;">WhatsApp</a> or reply to this email.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          💾 Save this email for future reference. The download link will remain active for 30 days.
        </p>
      </div>
    `,
  });
};
