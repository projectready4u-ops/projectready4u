'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  html_content: string;
  description: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');

      if (error) {
        console.warn('Email templates table not found - using defaults');
        // Provide default templates if table doesn't exist
        const defaultTemplates: EmailTemplate[] = [
          {
            id: '1',
            template_key: 'admin_notification',
            template_name: 'Admin Notification',
            subject: 'New Project Request',
            html_content: '<p>A new project request has been received.</p>',
            description: 'Sent to admin when new request arrives'
          },
          {
            id: '2',
            template_key: 'requester_confirmation',
            template_name: 'Request Confirmation',
            subject: 'Your Request Received',
            html_content: '<p>Your project request has been received and is being processed.</p>',
            description: 'Sent to student confirming request receipt'
          },
          {
            id: '3',
            template_key: 'project_approved',
            template_name: 'Project Approved',
            subject: 'Your Project is Ready',
            html_content: '<p>Your project request has been approved. Download your project now.</p>',
            description: 'Sent to student when project is approved'
          }
        ];
        setTemplates(defaultTemplates);
        setSelectedTemplate(defaultTemplates[0]);
        toast.info('Using default email templates. Deploy email_templates.sql to customize.');
        return;
      }
      
      setTemplates(data || []);
      if (data && data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: selectedTemplate.subject,
          html_content: selectedTemplate.html_content,
          template_name: selectedTemplate.template_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      toast.success('Email template updated successfully!');
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Failed to save email template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
        <AdminSidebar userName="Admin" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName="Admin" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Email Templates</h1>
          <p className="text-gray-400">Customize email templates sent to users and admins</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <Card className="border border-white/10 bg-white/5 p-4">
              <h2 className="text-lg font-bold text-white mb-4">Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{template.template_name}</div>
                    <div className="text-xs opacity-75 mt-1">{template.template_key}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-3">
            {selectedTemplate && (
              <div className="space-y-6">
                {/* Preview Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(false)}
                    style={{
                      background: previewMode ? 'transparent' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      color: '#ffffff !important',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: previewMode ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (previewMode) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(124, 58, 237, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (previewMode) {
                        e.currentTarget.style.background = 'transparent';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setPreviewMode(true)}
                    style={{
                      background: previewMode ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : 'transparent',
                      color: '#ffffff !important',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      border: previewMode ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!previewMode) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(124, 58, 237, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!previewMode) {
                        e.currentTarget.style.background = 'transparent';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                </div>

                {previewMode ? (
                  // Preview Mode
                  <Card className="border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Email Preview</h3>
                    <div className="bg-white p-4 rounded-lg" style={{ color: '#000000' }}>
                      <h4 className="font-bold mb-4" style={{ color: '#000000' }}>{selectedTemplate.subject}</h4>
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedTemplate.html_content }}
                        className="text-sm"
                        style={{ color: '#000000!important' }}
                      />
                    </div>
                  </Card>
                ) : (
                  // Edit Mode
                  <>
                    {/* Template Info */}
                    <Card className="border border-white/10 bg-white/5 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Template Information</h3>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-white mb-2 block">Template Name</Label>
                          <Input
                            value={selectedTemplate.template_name}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                template_name: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white mb-2 block">Email Subject</Label>
                          <Input
                            value={selectedTemplate.subject}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                subject: e.target.value,
                              })
                            }
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="e.g., ✅ Your Request Received — {project_title}"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Variables: {'{project_title}'}, {'{fullName}'}, {'{email}'}, {'{college}'}, {'{projectPrice}'}, {'{requestId}'}, {'{requestedAt}'}, {'{whatsapp}'}
                          </p>
                        </div>

                        <div>
                          <Label className="text-white mb-2 block">HTML Content</Label>
                          <textarea
                            value={selectedTemplate.html_content}
                            onChange={(e) =>
                              setSelectedTemplate({
                                ...selectedTemplate,
                                html_content: e.target.value,
                              })
                            }
                            className="w-full h-96 bg-white/5 border border-white/10 text-white p-3 rounded-lg font-mono text-sm resize-none"
                            placeholder="Enter HTML content for the email..."
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            You can use HTML and CSS. Use variables like {'{project_title}'} in your content.
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* Description */}
                    <Card className="border border-white/10 bg-white/5 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">About This Template</h3>
                      <p className="text-gray-300 text-sm">{selectedTemplate.description}</p>
                    </Card>

                    {/* Save Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveTemplate}
                        disabled={saving}
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                          color: '#ffffff !important',
                          padding: '12px 24px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          opacity: saving ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!saving) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(124, 58, 237, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <Card className="border border-violet-500/50 bg-violet-500/5 p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Available Variables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <strong className="text-white">{'{project_title}'}</strong> - Name of the project
            </div>
            <div>
              <strong className="text-white">{'{fullName}'}</strong> - Requester's full name
            </div>
            <div>
              <strong className="text-white">{'{email}'}</strong> - Requester's email address
            </div>
            <div>
              <strong className="text-white">{'{college}'}</strong> - Requester's college/institution
            </div>
            <div>
              <strong className="text-white">{'{projectPrice}'}</strong> - Project price in INR
            </div>
            <div>
              <strong className="text-white">{'{requestId}'}</strong> - Unique request ID
            </div>
            <div>
              <strong className="text-white">{'{requestedAt}'}</strong> - Date/time of request
            </div>
            <div>
              <strong className="text-white">{'{whatsapp}'}</strong> - WhatsApp number
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
