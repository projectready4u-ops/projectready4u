'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check credentials
      if (email === 'projectready4u@gmail.com' && password === 'AmbiChanna@Kallesh@123') {
        // Set auth in localStorage and cookie
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', email);
        document.cookie = 'adminAuth=true; path=/; max-age=86400';
        
        toast.success('Login successful!');
        
        // Redirect to callback URL or dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';
        setTimeout(() => {
          router.push(callbackUrl);
        }, 500);
        return;
      }

      toast.error('Invalid email or password');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-white/10 bg-white/5 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          ProjectReady4U
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-gray-400">Sign in to manage your projects</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="projectready4u@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-white flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-11 text-white font-semibold mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
