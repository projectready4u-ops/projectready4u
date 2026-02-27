'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
  userName?: string;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Get logged-in email from localStorage
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/projects', label: 'Projects', icon: '🎓' },
    { href: '/admin/requests', label: 'Requests', icon: '📮' },
    { href: '/admin/feedback', label: 'Feedback', icon: '⭐' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/admins', label: 'Admins', icon: '🔐' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/email-templates', label: 'Email Templates', icon: '📧' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    // Clear localStorage and cookies
    localStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuth');
    document.cookie = 'adminAuth=; path=/; max-age=0';
    
    window.location.href = '/admin';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen w-64 bg-gradient-to-b from-white/5 to-white/[0.02] border-r border-white/10 backdrop-blur flex flex-col transition-transform duration-300 z-40 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Project Ready 4U"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Admin</h2>
            <p className="text-xs text-gray-400">Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                onClick={() => setOpen(false)}
                variant={isActive(item.href) ? 'default' : 'ghost'}
                className={`w-full justify-start gap-2 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {adminEmail && <p className="text-xs text-gray-400 truncate">Logged in as:<br/>{adminEmail}</p>}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
