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

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

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
          projects:project_id(title, github_repo_link)
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
    try {
      setApprovingId(request.id);
      
      // Get the repo link from the project
      const projectData = request.projects as any;
      const repoLink = projectData?.github_repo_link;

      if (!repoLink) {
        toast.error('This project does not have a repository link configured');
        setApprovingId(null);
        return;
      }

      // Directly approve without modal
      await handleApprove(request, repoLink);
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setApprovingId(null);
    }
  };

  const handleApprove = async (request: ProjectRequest, repoLink: string) => {
    try {
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

      toast.success('✅ Request approved! Email sent with repository access.');
      loadRequests();
    } catch (error: any) {
      throw error;
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
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApproveClick(request)}
                          disabled={approvingId === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        >
                          {approvingId === request.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
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
          </>
        )}
      </main>
    </div>
  );
}

