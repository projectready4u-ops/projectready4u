'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { StatsCard } from '@/components/StatsCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MoreVertical, TrendingUp, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('adminAuth') || sessionStorage.getItem('adminAuth');
      if (!isAuth) {
        // Not authenticated - redirect to login
        window.location.href = '/admin';
        return;
      }
    }
    
    setIsAuthorized(true);
    setUser({ email: 'admin@projectready4u.com' });
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: projects } = await supabase.from('projects').select('id');
      const { data: requests } = await supabase.from('project_requests').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: pendingRequests } = await supabase.from('project_requests').select('id').eq('status', 'pending');
      const { data: approvedRequests } = await supabase.from('project_requests').select('id').eq('status', 'approved').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalProjects: projects?.length || 0,
        totalRequests: requests?.length || 0,
        pendingRequests: pendingRequests?.length || 0,
        approvedThisMonth: approvedRequests?.length || 0,
      });

      setRecentRequests(requests || []);

      // Generate chart data from requests
      const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      const requestsByDate = dates.map(date => {
        const count = requests?.filter((req: any) => 
          new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === date
        ).length || 0;
        return { date, requests: count };
      });

      setChartData(requestsByDate);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName={user?.email?.split('@')[0]} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-white/10 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              label="Total Projects"
              value={stats.totalProjects}
              icon={TrendingUp}
              color="violet"
            />
            <StatsCard
              label="Total Requests"
              value={stats.totalRequests}
              icon={Users}
              color="blue"
            />
            <StatsCard
              label="Pending Requests"
              value={stats.pendingRequests}
              icon={Clock}
              color="amber"
            />
            <StatsCard
              label="Approved (30d)"
              value={stats.approvedThisMonth}
              icon={CheckCircle}
              color="green"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requests Chart */}
            <Card className="border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Requests Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Line type="monotone" dataKey="requests" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Status Breakdown */}
            <Card className="border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Request Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: stats.pendingRequests },
                      { name: 'Approved', value: stats.approvedThisMonth },
                      { name: 'Other', value: Math.max(0, stats.totalRequests - stats.pendingRequests - stats.approvedThisMonth) },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#fbbf24" />
                    <Cell fill="#10b981" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Requests Table */}
          <Card className="border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Requests</h3>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {recentRequests.length > 0 ? (
              <div className="space-y-2 overflow-x-auto">
                {recentRequests.slice(0, 5).map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex-1">
                      <p className="text-white font-medium">{req.user_name}</p>
                      <p className="text-gray-400 text-sm">{req.college_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{req.status}</p>
                      <p className="text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No requests yet</p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
