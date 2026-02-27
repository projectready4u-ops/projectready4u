'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize default admin credentials on first load
  React.useEffect(() => {
    const credentials = localStorage.getItem('adminCredentials');
    if (!credentials) {
      const defaultCredentials = {
        'admin@projectready4u.com': { password: 'Admin@123456' },
      };
      localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
    }

    const admins = localStorage.getItem('admins');
    if (!admins) {
      const defaultAdmins = [
        {
          id: '1',
          email: 'admin@projectready4u.com',
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem('admins', JSON.stringify(defaultAdmins));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Check against stored credentials
    const credentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    
    // Default admin check
    if (email === 'admin@projectready4u.com' && password === 'Admin@123456') {
      // Set auth flag in localStorage and sessionStorage
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', email);
      sessionStorage.setItem('adminAuth', 'true');
      sessionStorage.setItem('adminEmail', email);
      
      // Set cookie for middleware
      document.cookie = 'adminAuth=true; path=/; max-age=86400';
      
      toast.success('Login successful!');
      
      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
      return;
    }
    
    // Check stored credentials
    if (credentials[email] && credentials[email].password === password) {
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', email);
      sessionStorage.setItem('adminAuth', 'true');
      sessionStorage.setItem('adminEmail', email);
      
      document.cookie = 'adminAuth=true; path=/; max-age=86400';
      
      toast.success('Login successful!');
      
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
      return;
    }
    
    toast.error('Invalid email or password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎓</div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Sign in to manage your projects</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-11 text-white font-semibold mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Demo credentials:
          <br />
          Email: admin@projectready4u.com
          <br />
          Password: Admin@123456
        </p>
      </Card>
    </div>
  );
}
