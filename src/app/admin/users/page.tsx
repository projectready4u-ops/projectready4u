'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Loader2, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  college_name: string;
  branch?: string;
  semester?: string;
  request_count: number;
  first_request_date: string;
  last_request_date: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: requests, error } = await supabase
        .from('project_requests')
        .select('id, user_name, user_email, user_phone, college_name, branch, semester, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by email to get unique users
      const userMap = new Map<string, User>();

      requests?.forEach((req: any) => {
        const email = req.user_email;
        if (!userMap.has(email)) {
          userMap.set(email, {
            id: req.user_email,
            user_name: req.user_name,
            user_email: req.user_email,
            user_phone: req.user_phone || '',
            college_name: req.college_name || '',
            branch: req.branch,
            semester: req.semester,
            request_count: 1,
            first_request_date: req.created_at,
            last_request_date: req.created_at,
          });
        } else {
          const existing = userMap.get(email)!;
          existing.request_count += 1;
          existing.last_request_date = req.created_at;
        }
      });

      setUsers(Array.from(userMap.values()));
      setFilteredUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerSearch = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.user_name.toLowerCase().includes(lowerSearch) ||
            user.user_email.toLowerCase().includes(lowerSearch) ||
            user.college_name.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [search, users]);

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleWhatsAppClick = (phone: string) => {
    const message = `Hi! I'm reaching out regarding your project request.`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName="Admin" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-gray-400">View all users who submitted project requests</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="Search by name, email, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-10 py-2 h-11"
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <Card className="border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">College</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Requests</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        {users.length === 0 ? 'No users found' : 'No results match your search'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{user.user_name}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{user.user_email}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{user.user_phone || '—'}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{user.college_name}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-xs font-medium">
                            {user.request_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEmailClick(user.user_email)}
                              className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            {user.user_phone && (
                              <button
                                onClick={() => handleWhatsAppClick(user.user_phone)}
                                className="p-2 rounded hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors"
                                title="Send WhatsApp"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Stats */}
        {!loading && users.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-white/10 bg-white/5 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </Card>
            <Card className="border border-white/10 bg-white/5 p-6">
              <p className="text-gray-400 text-sm mb-2">Total Requests</p>
              <p className="text-3xl font-bold text-white">{users.reduce((sum, u) => sum + u.request_count, 0)}</p>
            </Card>
            <Card className="border border-white/10 bg-white/5 p-6">
              <p className="text-gray-400 text-sm mb-2">Avg Requests/User</p>
              <p className="text-3xl font-bold text-white">
                {(users.reduce((sum, u) => sum + u.request_count, 0) / users.length).toFixed(1)}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
