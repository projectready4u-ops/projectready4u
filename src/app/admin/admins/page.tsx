'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2 } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Load admins from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admins');
    if (stored) {
      setAdmins(JSON.parse(stored));
    } else {
      // Initialize with default admin
      const defaultAdmins: Admin[] = [
        {
          id: '1',
          email: 'admin@projectready4u.com',
          created_at: new Date().toISOString(),
        },
      ];
      setAdmins(defaultAdmins);
      localStorage.setItem('admins', JSON.stringify(defaultAdmins));
    }
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail || !newAdminPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newAdminPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (admins.some(a => a.email === newAdminEmail)) {
      toast.error('This email is already an admin');
      return;
    }

    setLoading(true);
    try {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        email: newAdminEmail,
        created_at: new Date().toISOString(),
      };

      const updatedAdmins = [...admins, newAdmin];
      setAdmins(updatedAdmins);
      localStorage.setItem('admins', JSON.stringify(updatedAdmins));
      
      // Also store credentials locally (in production, use secure backend)
      const credentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');
      credentials[newAdminEmail] = { password: newAdminPassword };
      localStorage.setItem('adminCredentials', JSON.stringify(credentials));

      toast.success('Admin added successfully!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setShowAddModal(false);
    } catch (error) {
      toast.error('Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (id: string, email: string) => {
    // Prevent deleting the last admin
    if (admins.length <= 1) {
      toast.error('Cannot delete the last admin');
      return;
    }

    // Prevent deleting the default admin
    if (email === 'admin@projectready4u.com') {
      toast.error('Cannot delete the default admin account');
      return;
    }

    const updatedAdmins = admins.filter(a => a.id !== id);
    setAdmins(updatedAdmins);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));

    // Remove credentials
    const credentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    delete credentials[email];
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));

    toast.success('Admin removed successfully');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName="Admin" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Management</h1>
              <p className="text-gray-400">Manage administrator accounts</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Admins Table */}
        <Card className="border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Added</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{admin.email}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                          disabled={admins.length === 1 || admin.email === 'admin@projectready4u.com'}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Admin Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Admin</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  disabled={loading}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  disabled={loading}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={loading}
                  variant="ghost"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Admin'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
