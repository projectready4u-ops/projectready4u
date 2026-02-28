'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { INDIAN_STATES, isValidEmail, isValidPhone, generateWhatsAppLink, formatRequestDetailsForWhatsApp } from '@/lib/utils';
import { Project } from '@/types';
import { toast } from 'sonner';
import { Loader2, CheckCircle, MessageCircle } from 'lucide-react';

interface RequestModalProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  semester: string;
  message: string;
}

export function RequestModal({ project, open, onOpenChange }: RequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    branch: '',
    semester: '',
    message: '',
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!isValidPhone(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }
    if (!formData.college.trim()) {
      toast.error('College/University name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectTitle: project.title,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college: formData.college,
          branch: formData.branch || null,
          semester: formData.semester || null,
          message: formData.message || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('API error response:', data);
        throw new Error(data.error || 'Failed to submit request');
      }

      const data = await response.json();
      console.log('Request submitted successfully:', data);
      setRequestId(data.data?.[0]?.id || '');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        setRequestId('');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          college: '',
          branch: '',
          semester: '',
          message: '',
        });
      }, 4000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Request Access — {project.title}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          // Success Screen
          <div className="py-8 text-center space-y-4">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">✅ Request Received!</h3>
            <p className="text-gray-400">
              Check your WhatsApp for request details. We'll contact you shortly with more information about the project.
            </p>
            
            {/* Request Details Box */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left my-4">
              <h4 className="text-white font-semibold mb-3">📋 Your Request Details:</h4>
              <div className="space-y-2 text-sm text-gray-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Request ID:</span>
                  <span className="text-white">{requestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Project ID:</span>
                  <span className="text-white">{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Project:</span>
                  <span className="text-white">{project.title}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={() => {
                const businessPhone = localStorage.getItem('adminSettings') 
                  ? JSON.parse(localStorage.getItem('adminSettings') || '{}').whatsapp_number 
                  : '919876543210';
                
                const detailsMessage = formatRequestDetailsForWhatsApp(
                  project.id,
                  requestId,
                  project.title,
                  formData.fullName,
                  formData.college,
                  formData.email,
                  formData.phone
                );
                
                window.open(generateWhatsAppLink(businessPhone, detailsMessage), '_blank');
              }}
              style={{
                background: '#059669',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#047857';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#059669';
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Save Request Details on WhatsApp
            </button>
          </div>
        ) : (
          // Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <Label className="text-white font-semibold">Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white font-semibold">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-white font-semibold">Phone Number *</Label>
                <Input
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>

              {/* College */}
              <div>
                <Label className="text-white font-semibold">College / University Name *</Label>
                <Input
                  placeholder="Your College Name"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>

              {/* Branch */}
              <div>
                <Label className="text-white font-semibold">Branch</Label>
                <Input
                  placeholder="Computer Science"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>

              {/* Semester */}
              <div>
                <Label className="text-white font-semibold">Semester</Label>
                <Input
                  placeholder="6th"
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <Label className="text-white font-semibold">Message</Label>
              <Textarea
                placeholder="Any additional message or requirements..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-200 focus:border-white/40"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request 🚀'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
