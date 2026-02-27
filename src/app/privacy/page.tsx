'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacy();
  }, []);

  const loadPrivacy = async () => {
    try {
      setLoading(true);
      
      // Try to load from localStorage first
      const cachedSettings = localStorage.getItem('adminSettings');
      if (cachedSettings) {
        const settings = JSON.parse(cachedSettings);
        if (settings.privacy_content) {
          setContent(settings.privacy_content);
          return;
        }
      }

      // Try to load from Supabase
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'privacy_content')
        .single();

      if (data?.setting_value) {
        setContent(data.setting_value);
      } else {
        setContent('Privacy Policy content will be added by the admin.');
      }
    } catch (error) {
      console.error('Error loading privacy policy:', error);
      setContent('Privacy Policy content will be added by the admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <div 
              className="bg-white/5 border border-white/10 rounded-lg p-8 text-gray-300 whitespace-pre-wrap leading-relaxed"
              style={{ wordWrap: 'break-word' }}
            >
              {content}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="border-white/20 hover:border-white/40">
              Home
            </Button>
          </Link>
          <Link href="/terms">
            <Button variant="outline" className="border-white/20 hover:border-white/40">
              Terms & Conditions
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
