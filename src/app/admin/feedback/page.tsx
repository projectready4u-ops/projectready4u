'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Check, X, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  description: string;
  approved: boolean;
  created_at: string;
}

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    loadFeedback();
  }, [filter]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      let query = supabase.from('customer_feedback').select('*').order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('approved', false);
      } else if (filter === 'approved') {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading feedback:', error);
        toast.error('Failed to load feedback');
        return;
      }

      setFeedbacks(data || []);
      console.log(`Loaded ${data?.length || 0} ${filter} feedbacks`);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .update({ approved: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('✅ Feedback approved');
      loadFeedback();
    } catch (error: any) {
      console.error('Error approving feedback:', error);
      toast.error('Failed to approve feedback');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    setApproving(id);
    try {
      const { error } = await supabase
        .from('customer_feedback')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Feedback deleted');
      loadFeedback();
    } catch (error: any) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setApproving(null);
    }
  };

  const pendinCount = feedbacks.filter(f => !f.approved).length;
  const approvedCount = feedbacks.filter(f => f.approved).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName="Admin" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Customer Feedback</h1>
          <p className="text-gray-400">Review and approve customer feedback for display</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border border-white/10 bg-white/5 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Feedback</h3>
            <p className="text-3xl font-bold text-white">{feedbacks.length}</p>
          </Card>
          <Card className="border border-white/10 bg-white/5 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-400">{pendinCount}</p>
          </Card>
          <Card className="border border-white/10 bg-white/5 p-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-violet-600' : 'border-white/20'}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            variant={filter === 'pending' ? 'default' : 'outline'}
            className={filter === 'pending' ? 'bg-yellow-600' : 'border-white/20'}
          >
            Pending ({pendinCount})
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            variant={filter === 'approved' ? 'default' : 'outline'}
            className={filter === 'approved' ? 'bg-green-600' : 'border-white/20'}
          >
            Approved ({approvedCount})
          </Button>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : feedbacks.length === 0 ? (
          <Card className="border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-gray-400">No feedback {filter !== 'all' ? `(${filter})` : ''}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card
                key={feedback.id}
                className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{feedback.name}</h3>
                      <Badge className={feedback.approved ? 'bg-green-600' : 'bg-yellow-600'}>
                        {feedback.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{feedback.email}</p>

                    {/* Rating */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-2">{feedback.rating}/5</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{feedback.description}</p>

                    <p className="text-xs text-gray-500">
                      {new Date(feedback.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {!feedback.approved && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(feedback.id)}
                        disabled={approving === feedback.id}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                        size="sm"
                      >
                        {approving === feedback.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(feedback.id)}
                        disabled={approving === feedback.id}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-2"
                        size="sm"
                      >
                        {approving === feedback.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
