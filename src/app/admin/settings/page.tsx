'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Settings {
  whatsapp_number: string;
  admin_email: string;
  site_name: string;
  site_description: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    whatsapp_number: '919876543210',
    admin_email: 'admin@projectready4u.com',
    site_name: 'Projectready4U',
    site_description: 'Academic Project Marketplace',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('[LoadSettings] Starting to load settings...');

      // Default settings
      const defaultSettings: Settings = {
        whatsapp_number: '919876543210',
        admin_email: 'admin@projectready4u.com',
        site_name: 'Projectready4U',
        site_description: 'Academic Project Marketplace',
      };

      // Step 1: Try to load from Supabase
      console.log('[LoadSettings] Fetching from Supabase...');
      let loadedFromDb: any = {};
      
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_key, setting_value');

        if (error) {
          console.warn('[LoadSettings] Supabase error:', error);
        } else if (data && data.length > 0) {
          console.log('[LoadSettings] Fetched from DB:', data);
          data.forEach((item: any) => {
            if (item.setting_key === 'contact_email') {
              loadedFromDb['admin_email'] = item.setting_value;
            } else if (item.setting_key === 'whatsapp_number') {
              loadedFromDb['whatsapp_number'] = item.setting_value;
            } else if (item.setting_key === 'site_name') {
              loadedFromDb['site_name'] = item.setting_value;
            } else if (item.setting_key === 'site_description') {
              loadedFromDb['site_description'] = item.setting_value;
            }
          });
          console.log('[LoadSettings] Parsed from DB:', loadedFromDb);
        }
      } catch (supabaseError) {
        console.warn('[LoadSettings] Exception loading from Supabase:', supabaseError);
      }

      // Step 2: Combine: Database > localStorage > defaults
      const combinedSettings: Settings = {
        ...defaultSettings,
        ...loadedFromDb,
      };

      console.log('[LoadSettings] Final combined settings:', combinedSettings);

      // Step 3: Update state and localStorage
      setSettings(combinedSettings);
      localStorage.setItem('adminSettings', JSON.stringify(combinedSettings));
      console.log('[LoadSettings] ✓ Settings loaded and cached');
    } catch (error: any) {
      console.error('[LoadSettings] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.whatsapp_number.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }

    if (!settings.admin_email.trim()) {
      toast.error('Admin email is required');
      return;
    }

    setSaving(true);
    try {
      // Step 1: Save to localStorage (always works)
      console.log('[1] Saving to localStorage...');
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      console.log('[1] ✓ Settings saved to localStorage:', settings);

      // Step 2: Try to save to Supabase via API
      console.log('[2] Attempting to save to Supabase via API...');
      const settingsToUpdate = [
        { key: 'whatsapp_number', value: settings.whatsapp_number, description: 'WhatsApp business number' },
        { key: 'contact_email', value: settings.admin_email, description: 'Admin contact email' },
        { key: 'site_name', value: settings.site_name, description: 'Website name' },
        { key: 'site_description', value: settings.site_description, description: 'Site description' },
      ];

      let savedCount = 0;
      let errorCount = 0;

      for (const setting of settingsToUpdate) {
        try {
          console.log(`[2.${settingsToUpdate.indexOf(setting) + 1}] Saving ${setting.key}...`);
          
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setting),
          });

          const data = await response.json();

          if (!response.ok) {
            console.warn(`[2.${settingsToUpdate.indexOf(setting) + 1}] API error for ${setting.key}:`, data);
            errorCount++;
          } else {
            console.log(`[2.${settingsToUpdate.indexOf(setting) + 1}] ✓ ${setting.key} saved`);
            savedCount++;
          }
        } catch (settingError: any) {
          console.error(`[2.${settingsToUpdate.indexOf(setting) + 1}] Exception for ${setting.key}:`, settingError);
          errorCount++;
        }
      }

      console.log(`[3] API sync complete. Saved: ${savedCount}, Errors: ${errorCount}`);
      
      if (errorCount > 0) {
        console.warn(`⚠️ Some settings failed to sync to Supabase, but all settings are saved locally!`);
        toast.success(`Settings saved locally! (${savedCount}/${settingsToUpdate.length} synced to database)`);
      } else {
        toast.success('Settings saved successfully to both local storage and database! ✅');
      }
    } catch (error: any) {
      console.error('🔴 Error in handleSaveSettings:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        hint: error?.hint,
        details: error?.details,
      });
      toast.error('Settings saved locally. Database sync may have failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDebugCheck = async () => {
    console.log('[DEBUG] Checking database...');
    try {
      const response = await fetch('/api/settings/debug');
      const data = await response.json();
      console.log('[DEBUG] API Response:', data);
      
      if (data.success && data.data) {
        console.log('[DEBUG] Settings in database:', data.data);
        toast.success(`Found ${data.count} settings in database! Check console.`);
      } else {
        console.warn('[DEBUG] No settings found in database');
        toast.warning('No settings found in database. Check console for details.');
      }
    } catch (error: any) {
      console.error('[DEBUG] Error checking database:', error);
      toast.error('Error checking database');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName="Admin" />

      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage website settings and notification preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <form onSubmit={handleSaveSettings}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Communication Settings */}
              <Card className="border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Communication Settings</h2>

                <div className="space-y-6">
                  {/* WhatsApp Number */}
                  <div>
                    <Label htmlFor="whatsapp" className="text-white font-semibold mb-2 block">
                      WhatsApp Business Number
                    </Label>
                    <p className="text-xs text-gray-400 mb-3">
                      This number will receive WhatsApp messages from users. Use format: 919876543210
                    </p>
                    <Input
                      id="whatsapp"
                      type="text"
                      placeholder="919876543210"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      disabled={saving}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>

                  {/* Admin Email */}
                  <div>
                    <Label htmlFor="email" className="text-white font-semibold mb-2 block">
                      Admin Email Address
                    </Label>
                    <p className="text-xs text-gray-400 mb-3">
                      Email address to receive request notifications and project inquiries
                    </p>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@projectready4u.com"
                      value={settings.admin_email}
                      onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                      disabled={saving}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Site Settings */}
              <Card className="border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Site Settings</h2>

                <div className="space-y-6">
                  {/* Site Name */}
                  <div>
                    <Label htmlFor="siteName" className="text-white font-semibold mb-2 block">
                      Site Name
                    </Label>
                    <Input
                      id="siteName"
                      type="text"
                      placeholder="Projectready4U"
                      value={settings.site_name}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      disabled={saving}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>

                  {/* Site Description */}
                  <div>
                    <Label htmlFor="siteDesc" className="text-white font-semibold mb-2 block">
                      Site Description
                    </Label>
                    <Input
                      id="siteDesc"
                      type="text"
                      placeholder="Academic Project Marketplace"
                      value={settings.site_description}
                      onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                      disabled={saving}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Box */}
            <Card className="border border-violet-500/50 bg-violet-500/5 p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">💾 How These Settings Work</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <strong>📱 WhatsApp Number:</strong> When users submit a project request or click WhatsApp button, they'll chat with you on this number. Update it with yours!
                </li>
                <li>
                  <strong>📧 Admin Email:</strong> This is where users and admins can contact you. Used for notifications and inquiries in the future.
                </li>
                <li>
                  <strong>🌐 Site Settings:</strong> These appear in page titles and descriptions for SEO.
                </li>
                <li className="pt-2 border-t border-violet-500/30">
                  ✅ <strong>Settings are saved locally on your browser</strong> and work immediately! They also sync to the database when possible.
                </li>
              </ul>
            </Card>

            {/* Save Button */}
            <div className="mt-8 flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2 px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleDebugCheck}
                disabled={saving}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 gap-2"
              >
                🔍 Check Database
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
