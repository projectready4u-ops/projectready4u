-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_public_read" ON email_templates FOR SELECT USING (true);
CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE USING (true) WITH CHECK (true);

-- Insert default templates
INSERT INTO email_templates (template_key, template_name, subject, html_content, description) VALUES
(
  'admin_notification',
  'Admin Notification - New Request',
  '🔔 New Project Request — {project_title}',
  '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">New Project Request Received</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Action Required</p>
    </div>
    
    <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Request Details</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%; background-color: #f9fafb;">Project Name</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{project_title}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Requester Name</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{fullName}</td>
      </tr>
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Email Address</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;"><a href="mailto:{email}" style="color: #7c3aed; text-decoration: none;">{email}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Phone Number</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{phone}</td>
      </tr>
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Institution</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{college}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Received On</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{requestedAt}</td>
      </tr>
    </table>

    {message_section}

    <div style="background: #fef3c7; border-left: 4px solid #fcd34d; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
      <strong style="color: #92400e;">⚠️ Action Required:</strong>
      <p style="margin: 10px 0 0 0; color: #78350f;">Please review this request and approve or reject it at your earliest convenience.</p>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 30px;">
      <a href="{whatsapp_link}" style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">📱 Contact on WhatsApp</a>
      <a href="{admin_link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">📋 View in Admin Panel</a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </div>',
  'Email sent to admin when a new request is received'
),
(
  'requester_confirmation',
  'Requester Confirmation - Request Received',
  '✅ Your Request Received — {project_title}',
  '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Request Received Successfully ✅</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">We will review your request shortly</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Dear <strong>{fullName}</strong>,<br/><br/>
      Thank you for your interest in <strong>{project_title}</strong>. We have successfully received your request and our team will review it shortly.
    </p>

    <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Your Request Summary</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%; background-color: #f9fafb;">Project</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{project_title}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Your Name</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{fullName}</td>
      </tr>
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Institution</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">{college}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Project Price</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #10b981; font-weight: bold; font-size: 16px;">₹{projectPrice}</td>
      </tr>
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">Request ID</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">{requestId}</td>
      </tr>
    </table>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
      <strong style="color: #1e40af;">ℹ️ What Happens Next:</strong>
      <ol style="margin: 10px 0 0 0; color: #374151; padding-left: 20px;">
        <li>Our team will review your request</li>
        <li>We will contact you within 24 hours via WhatsApp or email</li>
        <li>Upon approval, you will receive your download link</li>
        <li>You can then download your project files</li>
      </ol>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
      📞 <strong>Have questions?</strong> Feel free to reach out to us:<br/>
      📱 <a href="https://wa.me/91{whatsapp}" style="color: #10b981; text-decoration: none;">Contact us on WhatsApp</a><br/>
      ✉️ Reply to this email directly
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      This is an automated confirmation email. Keep this for your records. Request ID mentioned above can be used for tracking.
    </p>
  </div>',
  'Email sent to requester confirming their request has been received'
),
(
  'project_approved',
  'Project Approved - Download Ready',
  '✅ Your Project is Ready for Download — {project_title}',
  '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px; color: white; margin-bottom: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Your Project is Ready! 🎉</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your request has been approved</p>
    </div>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Congratulations! Your request for <strong>{project_title}</strong> has been approved. Your download link is now ready and active.
    </p>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="{download_link}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">📥 Download Your Project</a>
    </div>

    <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Package Contents</h2>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
      <p style="margin: 0; color: #166534;"><strong>✅ Your download includes:</strong></p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #374151;">
        {includes_list}
      </ul>
    </div>

    <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Getting Started</h2>
    
    <div style="background: #fef3c7; border-left: 4px solid #fcd34d; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
      <ol style="margin: 0; padding-left: 20px; color: #374151;">
        <li>Click the download button above</li>
        <li>Extract the ZIP file to your desired location</li>
        <li>Read the README.md file for setup instructions</li>
        <li>Follow the documentation to implement the project</li>
        <li>Contact us if you need assistance</li>
      </ol>
    </div>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
      <strong style="color: #1e40af;">📋 Important Information:</strong>
      <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">
        Your download link will remain active for <strong>30 days</strong> from the approval date. After that, you may need to request access again.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
      📞 <strong>Need Help?</strong><br/>
      📱 <a href="https://wa.me/91{whatsapp}" style="color: #10b981; text-decoration: none;">Contact us on WhatsApp</a> for any questions or assistance<br/>
      ✉️ Reply to this email
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Thank you for choosing Projectready4U. We hope you find this project useful!
    </p>
  </div>',
  'Email sent to requester when their project has been approved'
)
ON CONFLICT DO NOTHING;
