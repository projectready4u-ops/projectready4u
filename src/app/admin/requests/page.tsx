'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Mail, Phone, RefreshCw, Zap } from 'lucide-react';

interface ProjectRequest {
  id: string;
  project_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  college_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  message?: string;
  download_link?: string;
  projects?: {
    title: string;
    github_repo_link?: string;
  };
}

interface ApprovalDialogState {
  isOpen: boolean;
  request: ProjectRequest | null;
  downloadLink: string;
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<ApprovalDialogState>({
    isOpen: false,
    request: null,
    downloadLink: '',
  });

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const isAuth = localStorage.getItem('adminAuth') || sessionStorage.getItem('adminAuth');
        if (!isAuth) {
          window.location.href = '/admin';
          return;
        }
      }
      
      setIsAuthorized(true);
      setUser({ email: 'admin@projectready4u.com' });
      loadRequests();
    };

    checkAuth();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_requests')
        .select(`
          *,
          projects:project_id(title, github_repo_link, google_drive_link)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = async (request: ProjectRequest) => {
    // Open approval dialog with default download link from project's Google Drive
    const projectData = request.projects as any;
    const defaultLink = projectData?.google_drive_link || projectData?.github_repo_link || '';
    
    setApprovalDialog({
      isOpen: true,
      request,
      downloadLink: defaultLink,
    });
  };

  const handleApprove = async (request: ProjectRequest, repoLink: string) => {
    try {
      if (!repoLink.trim()) {
        toast.error('Download link is required');
        return;
      }

      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          projectTitle: request.projects?.title,
          email: request.user_email,
          fullName: request.user_name,
          college: request.college_name,
          repoLink,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve request');
      }

      toast.success('✅ Request approved! Email sent with download link.');
      setApprovalDialog({ isOpen: false, request: null, downloadLink: '' });
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleApprovalDialogSubmit = async () => {
    if (!approvalDialog.request) return;
    setApprovingId(approvalDialog.request.id);
    try {
      await handleApprove(approvalDialog.request, approvalDialog.downloadLink);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Request rejected');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' ? true : req.status === filter
  );

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName={user?.email?.split('@')[0]} />
      <main className="flex-1 overflow-auto">
        {!isAuthorized ? (
          <div className="flex items-center justify-center h-screen">
            <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="border-b border-white/10 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Requests</h1>
          <p className="text-gray-400">Manage student project access requests</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'ghost'}
                className={`capitalize ${
                  filter === status
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setFilter(status as any)}
              >
                {status}
              </Button>
            ))}
            <div className="ml-auto">
              <Button
                onClick={loadRequests}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{request.user_name}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : request.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {request.user_email}
                        </div>
                        {request.user_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {request.user_phone}
                          </div>
                        )}
                        <div>College: {request.college_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </div>
                      </div>
                      {request.message && (
                        <p className="mt-3 text-gray-300 bg-white/5 p-3 rounded border border-white/5">
                          {request.message}
                        </p>
                      )}

                      {/* Show download info for approved requests */}
                      {request.status === 'approved' && request.download_link && (
                        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-green-400">Download Ready</span>
                          </div>
                          <p className="text-xs text-gray-300">
                            Student can download the project ZIP file. Download link valid for 30 days.
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex flex-wrap gap-1 md:gap-2 ml-0 md:ml-4 mt-3 md:mt-0">
                        <button
                          onClick={() => handleApproveClick(request)}
                          disabled={approvingId === request.id}
                          style={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#ffffff !important',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: approvingId === request.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease',
                            opacity: approvingId === request.id ? 0.6 : 1,
                            flex: '1 1 auto',
                          }}
                          onMouseEnter={(e) => {
                            if (approvingId !== request.id) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #047857 0%, #065f46 100%)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(5, 150, 105, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {approvingId === request.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                              <span className="hidden sm:inline">Approving...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              <span className="hidden sm:inline">Approve</span>
                              <span className="sm:hidden">OK</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          style={{
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            color: '#ffffff !important',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease',
                            flex: '1 1 auto',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(220, 38, 38, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✕</span>
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5 p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Requests</h3>
              <p className="text-gray-400">
                {filter === 'all'
                  ? 'No student requests yet'
                  : `No ${filter} requests`}
              </p>
            </Card>
          )}
        </div>
        
        {/* Approval Dialog Modal */}
        {approvalDialog.isOpen && approvalDialog.request && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border border-white/20 bg-[#1a1a1a]">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Approve Request</h2>
                
                <div className="mb-4 p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-sm text-gray-300"><strong>Student:</strong> {approvalDialog.request.user_name}</p>
                  <p className="text-sm text-gray-300"><strong>Email:</strong> {approvalDialog.request.user_email}</p>
                  <p className="text-sm text-gray-300"><strong>Project:</strong> {approvalDialog.request.projects?.title}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white mb-2">
                    📥 Download Link
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Paste a direct download link. Options:<br/>
                    • Google Drive share link<br/>
                    • Dropbox share link<br/>
                    • GitHub repo URL<br/>
                    • OneDrive share link
                  </p>
                  <textarea
                    value={approvalDialog.downloadLink}
                    onChange={(e) => setApprovalDialog({
                      ...approvalDialog,
                      downloadLink: e.target.value
                    })}
                    placeholder="https://drive.google.com/file/d/... or https://github.com/owner/repo"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setApprovalDialog({ isOpen: false, request: null, downloadLink: '' })}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprovalDialogSubmit}
                    disabled={approvingId === approvalDialog.request.id || !approvalDialog.downloadLink.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {approvingId === approvalDialog.request.id ? 'Approving...' : '✓ Approve'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}

