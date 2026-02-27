'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Github } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (repoLink: string) => Promise<void>;
  requestId: string;
  userName: string;
  projectTitle: string;
  isLoading?: boolean;
}

export function ApprovalModal({
  isOpen,
  onClose,
  onApprove,
  requestId,
  userName,
  projectTitle,
  isLoading = false,
}: ApprovalModalProps) {
  const [repoLink, setRepoLink] = useState('');
  const [approving, setApproving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoLink.trim()) {
      toast.error('Please enter the repository link');
      return;
    }

    if (!isValidUrl(repoLink)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setApproving(true);
    try {
      await onApprove(repoLink);
      setRepoLink('');
      onClose();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-2">Approve Request</h2>
        <p className="text-gray-400 text-sm mb-6">
          {userName} • {projectTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Repository Link</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="url"
                placeholder="https://github.com/username/repo"
                value={repoLink}
                onChange={(e) => setRepoLink(e.target.value)}
                className="bg-white/5 border-white/10 text-white pl-9 placeholder:text-gray-500"
                disabled={approving}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enter the GitHub repo URL or private repo access link that users will use to access the project code.
            </p>
          </div>

          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 text-sm">
            <p className="text-violet-200">
              ℹ️ The user will receive this link via email and can clone/access the repository.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={approving}
              variant="outline"
              className="flex-1 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={approving || !repoLink.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  ✓ Approve Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
